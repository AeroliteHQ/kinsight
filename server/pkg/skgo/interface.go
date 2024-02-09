package skgo

type Cluster interface {
	CreateTopic() (string, error)
	DeleteTopics() (string, error)
}
