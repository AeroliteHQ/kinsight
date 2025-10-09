package handler

import (
	"strconv"

	"github.com/AeroliteHQ/kinsight/server/pkg/service"
	"github.com/gofiber/fiber/v2"
)

type MessageHandler struct {
	kafka *service.KafkaService
}

func NewMessageHandler(kafka *service.KafkaService) *MessageHandler {
	return &MessageHandler{kafka: kafka}
}

// GetMessages godoc
// @Summary Get messages from a topic
// @Description Fetch messages from a specific topic partition
// @Tags messages
// @Produce json
// @Param topic path string true "Topic name"
// @Param partition query int false "Partition number" default(0)
// @Param offset query string false "Offset position (latest, earliest, or number)" default(latest)
// @Param limit query int false "Maximum number of messages" default(100)
// @Success 200 {array} service.Message
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/topics/{topic}/messages [get]
func (h *MessageHandler) GetMessages(c *fiber.Ctx) error {
	topic := c.Params("topic")
	if topic == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "topic is required",
		})
	}

	partition := c.QueryInt("partition", 0)
	offset := c.Query("offset", "latest")
	limit := c.QueryInt("limit", 100)

	if limit > 1000 {
		limit = 1000
	}

	var offsetValue int64
	switch offset {
	case "latest":
		offsetValue = -1
	case "earliest":
		offsetValue = -2
	default:
		val, err := strconv.ParseInt(offset, 10, 64)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "invalid offset value",
			})
		}
		offsetValue = val
	}

	messages, err := h.kafka.GetMessages(c.Context(), topic, int32(partition), offsetValue, limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(messages)
}

// PublishMessage godoc
// @Summary Publish a message to a topic
// @Description Send a message to a specific topic partition
// @Tags messages
// @Accept json
// @Produce json
// @Param topic path string true "Topic name"
// @Param message body PublishMessageRequest true "Message payload"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/topics/{topic}/messages [post]
func (h *MessageHandler) PublishMessage(c *fiber.Ctx) error {
	topic := c.Params("topic")
	if topic == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "topic is required",
		})
	}

	var req PublishMessageRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	result, err := h.kafka.PublishMessage(c.Context(), topic, req.Key, req.Value, req.Partition)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(result)
}

type PublishMessageRequest struct {
	Key       *string `json:"key,omitempty"`
	Value     string  `json:"value"`
	Partition *int32  `json:"partition,omitempty"`
}
