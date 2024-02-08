package config

type Config struct {
	// internal server instance
	KInSight  KInSight  `yaml:"kInSight"`
	Kafka     Kafka     `yaml:"kafka"`
	APIConfig APIConfig `yaml:"apiConfig"`
}

func NewConfig() *Config {
	return &Config{}
}
