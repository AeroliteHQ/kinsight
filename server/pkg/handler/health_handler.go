package handler

import (
	"github.com/gofiber/fiber/v2"
)

type HealthHandler struct{}

func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

// @Summary Health check
// @Description Check if the API is running
// @Tags health
// @Produce json
// @Success 200 {object} map[string]string
// @Router /api/health [get]
func (h *HealthHandler) Check(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"status": "ok",
	})
}
