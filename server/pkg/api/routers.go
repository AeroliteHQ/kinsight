package api

import (
	"strings"

	_ "github.com/AeroliteHQ/kinsight/server/docs"
	"github.com/AeroliteHQ/kinsight/server/pkg/handler"
	fiber "github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/swagger"
)

// @title KInsight API
// @version 0.1
// @description Modern Kafka UI and Management API
// @termsOfService http://swagger.io/terms/
// @contact.name AeroliteHQ
// @contact.email aerolite@gmail.com
// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html
// @host localhost:7878
// @BasePath /
func (a *API) makeRouters() *fiber.App {
	app := fiber.New(fiber.Config{
		AppName: "KInsight",
	})

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: strings.Join(a.Config.APIConfig.CORSOrigins, ","),
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
	}))

	// Swagger
	app.Get("/swagger/*", swagger.New(swagger.Config{
		URL:         "/swagger/doc.json",
		DeepLinking: false,
	}))

	// Health check
	healthHandler := handler.NewHealthHandler()
	app.Get("/api/health", healthHandler.Check)

	// API routes
	api := app.Group("/api")

	if a.Kafka != nil {
		// Topics
		topicHandler := handler.NewTopicHandler(a.Kafka)
		api.Get("/topics", topicHandler.List)
		api.Post("/topics", topicHandler.Create)
		api.Delete("/topics/:name", topicHandler.Delete)

		// Messages
		messageHandler := handler.NewMessageHandler(a.Kafka)
		api.Get("/topics/:topic/messages", messageHandler.GetMessages)
		api.Post("/topics/:topic/messages", messageHandler.PublishMessage)

		// Consumer Groups
		consumerHandler := handler.NewConsumerGroupHandler(a.Kafka)
		api.Get("/consumer-groups", consumerHandler.List)

		// Brokers
		brokerHandler := handler.NewBrokerHandler(a.Kafka)
		api.Get("/brokers", brokerHandler.List)
		api.Get("/brokers/:id/config", brokerHandler.GetConfig)
	}

	// Schema Registry
	schemaHandler := handler.NewSchemaRegistryHandler(a.Config.SchemaRegistry)
	api.Get("/schema-registry/subjects", schemaHandler.ListSubjects)
	api.Get("/schema-registry/subjects/:subject/versions", schemaHandler.GetVersions)
	api.Post("/schema-registry/subjects/:subject/versions", schemaHandler.CreateSchema)

	// Kafka Connect
	connectHandler := handler.NewKafkaConnectHandler(a.Config.KafkaConnect)
	api.Get("/connect/connectors", connectHandler.ListConnectors)
	api.Get("/connect/connector-plugins", connectHandler.ListPlugins)
	api.Post("/connect/connectors", connectHandler.CreateConnector)
	api.Delete("/connect/connectors/:name", connectHandler.DeleteConnector)
	api.Put("/connect/connectors/:name/pause", connectHandler.PauseConnector)
	api.Put("/connect/connectors/:name/resume", connectHandler.ResumeConnector)

	return app
}
