package handler

import (
	"github.com/AeroliteHQ/kinsight/server/pkg/service"
	"github.com/gofiber/fiber/v2"
)

type TopicHandler struct {
	kafka *service.KafkaService
}

func NewTopicHandler(kafka *service.KafkaService) *TopicHandler {
	return &TopicHandler{kafka: kafka}
}

// @Summary List all Kafka topics
// @Description Get all topics from Kafka cluster
// @Tags topics
// @Produce json
// @Success 200 {array} service.Topic
// @Router /api/topics [get]
func (h *TopicHandler) List(c *fiber.Ctx) error {
	topics, err := h.kafka.ListTopics(c.Context())
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(topics)
}

// @Summary Create a new topic
// @Description Create a new Kafka topic
// @Tags topics
// @Accept json
// @Produce json
// @Param request body service.CreateTopicRequest true "Topic creation request"
// @Success 201
// @Router /api/topics [post]
func (h *TopicHandler) Create(c *fiber.Ctx) error {
	var req service.CreateTopicRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
	}

	if err := h.kafka.CreateTopic(c.Context(), req); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.SendStatus(201)
}

// @Summary Delete a topic
// @Description Delete a Kafka topic by name
// @Tags topics
// @Param name path string true "Topic name"
// @Success 204
// @Router /api/topics/{name} [delete]
func (h *TopicHandler) Delete(c *fiber.Ctx) error {
	name := c.Params("name")
	if name == "" {
		return c.Status(400).JSON(fiber.Map{"error": "topic name required"})
	}

	if err := h.kafka.DeleteTopic(c.Context(), name); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.SendStatus(204)
}
