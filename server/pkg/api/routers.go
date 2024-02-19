package api

import (
	_ "github.com/AeroliteHQ/kinsight/server/docs"
	"github.com/AeroliteHQ/kinsight/server/pkg/handler"
	fiber "github.com/gofiber/fiber/v2"
	"github.com/gofiber/swagger"
)

// @title KInsight API
// @version 0.1
// @description This is a swagger for KInsight API.
// @termsOfService http://swagger.io/terms/
// @contact.name AeroliteHQ
// @contact.email aerolite@gmail.com
// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html
// @host localhost:7878
// @BasePath /
func (a *API) makeRouters() *fiber.App {
	app := fiber.New()
	app.Get("/swagger/*", swagger.New(swagger.Config{
		URL:         "/swagger/doc.json",
		DeepLinking: false,
	})) // default

	//app.Get("/swagger/*", swagger.New(swagger.Config{ // custom
	//	URL:         "http://example.com/swagger.json",
	//	DeepLinking: false,
	//	// Expand ("list") or Collapse ("none") tag groups by default
	//	DocExpansion: "none",
	//	// Prefill OAuth ClientId on Authorize popup
	//	OAuth: &swagger.OAuthConfig{
	//		AppName:  "OAuth Provider",
	//		ClientId: "21bb4edc-05a7-4afc-86f1-2e151e4ba6e2",
	//	},
	//	// Ability to change OAuth2 redirect uri location
	//	OAuth2RedirectUrl: "http://localhost:7878/swagger/oauth2-redirect.html",
	//}))

	api := app.Group("/api")

	//Kafka Users
	api.Get("/users", handler.GetUsersHandler)
	api.Post("/users", handler.CreateUsersHandler)
	api.Delete("/users", handler.DeleteUsersHandler)
	//Kafka ACLS
	api.Get("/acls", handler.GetAclsHandler)
	api.Post("/acls", handler.CreateAclsHandler)
	api.Delete("/acls", handler.DeleteAclsHandler)
	//Kafka Topics
	api.Get("/topics", handler.GetTopicsHandler)
	api.Post("/topics", handler.CreateTopicsHandler)
	api.Delete("/topics", handler.DeleteTopicsHandler)

	return app
}
