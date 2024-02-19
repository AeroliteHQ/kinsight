package main

import (
	api2 "github.com/AeroliteHQ/kinsight/server/pkg/api"
	"github.com/AeroliteHQ/kinsight/server/pkg/config"
)

func main() {
	cfg := config.NewConfig()
	api := api2.NewAPI(cfg)
	api.Start()
}
