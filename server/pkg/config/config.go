package config

import (
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	KInSight       KInSight       `yaml:"kInSight"`
	Kafka          Kafka          `yaml:"kafka"`
	APIConfig      APIConfig      `yaml:"apiConfig"`
	Connect        Connect        `yaml:"connect"`
	SchemaRegistry SchemaRegistry `yaml:"schemaRegistry"`
	KafkaConnect   KafkaConnect   `yaml:"kafkaConnect"`
}

func NewConfig() *Config {
	return &Config{
		KInSight: KInSight{
			Environment: getEnv("KINSIGHT_ENV", "development"),
			Version:     getEnv("KINSIGHT_VERSION", "dev"),
		},
		Kafka: Kafka{
			Brokers:       getEnvAsSlice("KAFKA_BROKERS", []string{"localhost:9092"}),
			ClientID:      getEnv("KAFKA_CLIENT_ID", "kinsight"),
			SASLEnabled:   getEnvAsBool("KAFKA_SASL_ENABLED", false),
			SASLMechanism: getEnv("KAFKA_SASL_MECHANISM", "PLAIN"),
			SASLUsername:  getEnv("KAFKA_SASL_USERNAME", ""),
			SASLPassword:  getEnv("KAFKA_SASL_PASSWORD", ""),
			TLSEnabled:    getEnvAsBool("KAFKA_TLS_ENABLED", false),
		},
		APIConfig: APIConfig{
			ListenerAddress: getEnv("API_HOST", "0.0.0.0"),
			ListenerPort:    getEnvAsInt("API_PORT", 7878),
			CORSOrigins:     getEnvAsSlice("CORS_ORIGINS", []string{"*"}),
		},
		Connect: Connect{
			Enabled:  getEnvAsBool("CONNECT_ENABLED", false),
			URL:      getEnv("CONNECT_URL", ""),
			Username: getEnv("CONNECT_USERNAME", ""),
			Password: getEnv("CONNECT_PASSWORD", ""),
		},
		SchemaRegistry: SchemaRegistry{
			Enabled:  getEnvAsBool("SCHEMA_REGISTRY_ENABLED", false),
			URL:      getEnv("SCHEMA_REGISTRY_URL", ""),
			Username: getEnv("SCHEMA_REGISTRY_USERNAME", ""),
			Password: getEnv("SCHEMA_REGISTRY_PASSWORD", ""),
		},
		KafkaConnect: KafkaConnect{
			Enabled:  getEnvAsBool("KAFKA_CONNECT_ENABLED", false),
			URL:      getEnv("KAFKA_CONNECT_URL", ""),
			Username: getEnv("KAFKA_CONNECT_USERNAME", ""),
			Password: getEnv("KAFKA_CONNECT_PASSWORD", ""),
		},
	}
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

func getEnvAsInt(key string, defaultVal int) int {
	if valStr := os.Getenv(key); valStr != "" {
		if val, err := strconv.Atoi(valStr); err == nil {
			return val
		}
	}
	return defaultVal
}

func getEnvAsBool(key string, defaultVal bool) bool {
	if valStr := os.Getenv(key); valStr != "" {
		if val, err := strconv.ParseBool(valStr); err == nil {
			return val
		}
	}
	return defaultVal
}

func getEnvAsSlice(key string, defaultVal []string) []string {
	if valStr := os.Getenv(key); valStr != "" {
		return strings.Split(valStr, ",")
	}
	return defaultVal
}

func getEnvAsDuration(key string, defaultVal time.Duration) time.Duration {
	if valStr := os.Getenv(key); valStr != "" {
		if val, err := time.ParseDuration(valStr); err == nil {
			return val
		}
	}
	return defaultVal
}
