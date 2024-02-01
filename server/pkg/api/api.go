package api

import (
	"github.com/AeroliteHQ/kinsight/server/pkg/config"
	"github.com/rs/zerolog"
	"os"
)

type API struct {
	// internal server intance
	Config *config.Config
	Log    *zerolog.Logger
}

func NewAPI(cfg *config.Config) *API {
	zerolog.SetGlobalLevel(zerolog.ErrorLevel)
	log := zerolog.New(os.Stderr).With().Timestamp().Logger()
	return &API{
		Config: cfg,
		Log:    &log,
	}
}

func (a *API) Start() {
	
}
