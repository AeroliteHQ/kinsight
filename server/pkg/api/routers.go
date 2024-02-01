package api

import (
	"github.com/AeroliteHQ/kinsight/server/pkg/handler"
	chi "github.com/go-chi/chi/v5"
)

func (a *API) makeRouters() *chi.Mux {
	r := chi.NewRouter()

	r.Group(func(router chi.Router) {
		r.Route("/api", func(r chi.Router) {
			r.Get("/topics", handler.GetTopicsHandler())
			r.Post("/topics", handler.CreateTopicsHandler())
			r.Delete("/topics/{topicName}", handler.DeleteTopicHandler())
		})
	})

	return r
}
