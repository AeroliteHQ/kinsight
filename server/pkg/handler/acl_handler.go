package handler

import (
	"github.com/gofiber/fiber/v2"
	"net/http"
)

func GetAclsHandler(ctx *fiber.Ctx) error {
	return ctx.Status(http.StatusOK).JSON(fiber.Map{
		"message": "Hello, World!",
	})
}

func CreateAclsHandler(ctx *fiber.Ctx) error {
	return ctx.Status(http.StatusOK).JSON(fiber.Map{
		"message": "Hello, World!",
	})
}

func DeleteAclsHandler(ctx *fiber.Ctx) error {
	return ctx.Status(http.StatusOK).JSON(fiber.Map{
		"message": "Hello, World!",
	})
}
