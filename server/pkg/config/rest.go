package config

type APIConfig struct {
	ListenerAddress string   `yaml:"listenerAddress"`
	ListenerPort    int      `yaml:"listenerPort"`
	CORSOrigins     []string `yaml:"corsOrigins"`
}
