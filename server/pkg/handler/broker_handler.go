package handler

import (
	"github.com/AeroliteHQ/kinsight/server/pkg/service"
	"github.com/gofiber/fiber/v2"
)

type BrokerHandler struct {
	kafka *service.KafkaService
}

func NewBrokerHandler(kafka *service.KafkaService) *BrokerHandler {
	return &BrokerHandler{kafka: kafka}
}

// List godoc
// @Summary List all Kafka brokers
// @Description Get list of all Kafka brokers in the cluster
// @Tags brokers
// @Produce json
// @Success 200 {array} service.Broker
// @Failure 500 {object} map[string]string
// @Router /api/brokers [get]
func (h *BrokerHandler) List(c *fiber.Ctx) error {
	brokers, err := h.kafka.ListBrokers(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(brokers)
}

// GetConfig godoc
// @Summary Get broker configuration
// @Description Get configuration for a specific broker
// @Tags brokers
// @Produce json
// @Param id path int true "Broker ID"
// @Success 200 {array} service.BrokerConfig
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/brokers/{id}/config [get]
func (h *BrokerHandler) GetConfig(c *fiber.Ctx) error {
	brokerId, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid broker id",
		})
	}

	config, err := h.kafka.GetBrokerConfig(c.Context(), int32(brokerId))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(config)
}
