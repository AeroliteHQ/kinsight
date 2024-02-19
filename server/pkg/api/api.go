package api

import (
	"github.com/AeroliteHQ/kinsight/server/pkg/config"
	"github.com/rs/zerolog"
	"log"
	"os"
	"strconv"
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
	app := a.makeRouters()
	a.Config.APIConfig.ListenerPort = 7878
	log.Fatal(app.Listen(":" + strconv.Itoa(a.Config.APIConfig.ListenerPort)))

	//listener, err := net.Listen("tcp", net.JoinHostPort("", strconv.Itoa(a.Config.APIConfig.ListenerPort)))
	//if err != nil {
	//	return
	//}
	//event := a.Log.Info()
	//event.Msgf("Server listening on address", "address", listener.Addr().String(), "port", a.Config.APIConfig.ListenerPort)
}
