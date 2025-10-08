package api

import (
	"fmt"
	"log"
	"os"

	"github.com/AeroliteHQ/kinsight/server/pkg/config"
	"github.com/AeroliteHQ/kinsight/server/pkg/service"
	"github.com/rs/zerolog"
)

type API struct {
	Config *config.Config
	Log    *zerolog.Logger
	Kafka  *service.KafkaService
}

func NewAPI(cfg *config.Config) *API {
	zerolog.SetGlobalLevel(zerolog.InfoLevel)
	logger := zerolog.New(os.Stderr).With().Timestamp().Logger()

	kafka, err := service.NewKafkaService(cfg.Kafka)
	if err != nil {
		logger.Warn().Err(err).Msg("failed to initialize kafka service")
	}

	return &API{
		Config: cfg,
		Log:    &logger,
		Kafka:  kafka,
	}
}

func (a *API) Start() {
	app := a.makeRouters()

	addr := fmt.Sprintf("%s:%d", a.Config.APIConfig.ListenerAddress, a.Config.APIConfig.ListenerPort)
	a.Log.Info().Str("address", addr).Msg("starting server")

	log.Fatal(app.Listen(addr))
}

func (a *API) Shutdown() {
	if a.Kafka != nil {
		a.Kafka.Close()
	}
}
