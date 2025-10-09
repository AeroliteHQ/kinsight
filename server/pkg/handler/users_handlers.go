package handler

import (
	"github.com/gofiber/fiber/v2"
	"net/http"
)

func GetUsersHandler(ctx *fiber.Ctx) error {
	return ctx.Status(http.StatusOK).JSON(fiber.Map{
		"message": "Hello, World!",
	})
}

func CreateUsersHandler(ctx *fiber.Ctx) error {
	return ctx.Status(http.StatusOK).JSON(fiber.Map{
		"message": "Hello, World!",
	})
}

func DeleteUsersHandler(ctx *fiber.Ctx) error {
	return ctx.Status(http.StatusOK).JSON(fiber.Map{
		"message": "Hello, World!",
	})
}
