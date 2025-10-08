package config

type Kafka struct {
	Brokers       []string `yaml:"brokers"`
	ClientID      string   `yaml:"clientId"`
	SASLEnabled   bool     `yaml:"saslEnabled"`
	SASLMechanism string   `yaml:"saslMechanism"`
	SASLUsername  string   `yaml:"saslUsername"`
	SASLPassword  string   `yaml:"saslPassword"`
	TLSEnabled    bool     `yaml:"tlsEnabled"`
}
