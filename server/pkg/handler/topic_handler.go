package handler

import (
	"github.com/gofiber/fiber/v2"
	"net/http"
)

// GetTopicsHandler godoc
// @Summary Get All Kafka Topics
// @Description Get all Kafka Topics
// @Accept  json
// @Produce  json
// @Success 200 {object} string
// @Failure 400 {object} error
// @Failure 404 {object} error
// @Failure 500 {object} error
// @Router /api/topics [get]
func GetTopicsHandler(ctx *fiber.Ctx) error {
	return ctx.Status(http.StatusOK).JSON(fiber.Map{
		"message": "Hello, World!",
	})
}

func CreateTopicsHandler(ctx *fiber.Ctx) error {
	return ctx.Status(http.StatusOK).JSON(fiber.Map{
		"message": "Hello, World!",
	})
}

func DeleteTopicsHandler(ctx *fiber.Ctx) error {
	return ctx.Status(http.StatusOK).JSON(fiber.Map{
		"message": "Hello, World!",
	})
}
