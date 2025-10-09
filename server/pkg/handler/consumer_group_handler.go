package handler

import (
	"github.com/AeroliteHQ/kinsight/server/pkg/service"
	"github.com/gofiber/fiber/v2"
)

type ConsumerGroupHandler struct {
	kafka *service.KafkaService
}

func NewConsumerGroupHandler(kafka *service.KafkaService) *ConsumerGroupHandler {
	return &ConsumerGroupHandler{kafka: kafka}
}

// @Summary List all consumer groups
// @Description Get all consumer groups from Kafka cluster
// @Tags consumer-groups
// @Produce json
// @Success 200 {array} service.ConsumerGroup
// @Router /api/consumer-groups [get]
func (h *ConsumerGroupHandler) List(c *fiber.Ctx) error {
	groups, err := h.kafka.ListConsumerGroups(c.Context())
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(groups)
}
