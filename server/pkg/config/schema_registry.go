package config

type SchemaRegistry struct {
	Enabled  bool   `yaml:"enabled"`
	URL      string `yaml:"url"`
	Username string `yaml:"username"`
	Password string `yaml:"password"`
}

type KafkaConnect struct {
	Enabled  bool   `yaml:"enabled"`
	URL      string `yaml:"url"`
	Username string `yaml:"username"`
	Password string `yaml:"password"`
}
