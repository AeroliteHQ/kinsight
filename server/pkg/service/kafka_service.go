package service

import (
	"context"
	"crypto/tls"
	"fmt"
	"sort"

	"github.com/AeroliteHQ/kinsight/server/pkg/config"
	"github.com/IBM/sarama"
)

type KafkaService struct {
	config config.Kafka
	client sarama.Client
	admin  sarama.ClusterAdmin
}

func NewKafkaService(cfg config.Kafka) (*KafkaService, error) {
	if len(cfg.Brokers) == 0 {
		return nil, fmt.Errorf("no kafka brokers configured")
	}

	saramaConfig := sarama.NewConfig()
	saramaConfig.Version = sarama.V3_0_0_0
	saramaConfig.ClientID = cfg.ClientID

	// Producer configuration
	saramaConfig.Producer.Return.Successes = true
	saramaConfig.Producer.RequiredAcks = sarama.WaitForAll
	saramaConfig.Producer.Retry.Max = 3

	if cfg.TLSEnabled {
		saramaConfig.Net.TLS.Enable = true
		saramaConfig.Net.TLS.Config = &tls.Config{
			InsecureSkipVerify: true,
		}
	}

	if cfg.SASLEnabled {
		saramaConfig.Net.SASL.Enable = true
		saramaConfig.Net.SASL.User = cfg.SASLUsername
		saramaConfig.Net.SASL.Password = cfg.SASLPassword

		switch cfg.SASLMechanism {
		case "PLAIN":
			saramaConfig.Net.SASL.Mechanism = sarama.SASLTypePlaintext
		case "SCRAM-SHA-256":
			saramaConfig.Net.SASL.Mechanism = sarama.SASLTypeSCRAMSHA256
		case "SCRAM-SHA-512":
			saramaConfig.Net.SASL.Mechanism = sarama.SASLTypeSCRAMSHA512
		default:
			saramaConfig.Net.SASL.Mechanism = sarama.SASLTypePlaintext
		}
	}

	client, err := sarama.NewClient(cfg.Brokers, saramaConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create kafka client: %w", err)
	}

	admin, err := sarama.NewClusterAdminFromClient(client)
	if err != nil {
		client.Close()
		return nil, fmt.Errorf("failed to create cluster admin: %w", err)
	}

	return &KafkaService{
		config: cfg,
		client: client,
		admin:  admin,
	}, nil
}

func (s *KafkaService) Close() error {
	if s.admin != nil {
		s.admin.Close()
	}
	if s.client != nil {
		return s.client.Close()
	}
	return nil
}

// Topics

type Topic struct {
	Name              string            `json:"name"`
	Partitions        int               `json:"partitions"`
	ReplicationFactor int               `json:"replicationFactor"`
	Internal          bool              `json:"internal"`
	Config            map[string]string `json:"config"`
}

func (s *KafkaService) ListTopics(ctx context.Context) ([]Topic, error) {
	topics, err := s.client.Topics()
	if err != nil {
		return nil, err
	}

	result := make([]Topic, 0, len(topics))

	for _, topicName := range topics {
		metadata, err := s.admin.DescribeTopics([]string{topicName})
		if err != nil {
			continue
		}

		if len(metadata) == 0 {
			continue
		}

		meta := metadata[0]

		configResource := sarama.ConfigResource{
			Type: sarama.TopicResource,
			Name: topicName,
		}

		configs, err := s.admin.DescribeConfig(configResource)
		if err != nil {
			continue
		}

		configMap := make(map[string]string)
		for _, entry := range configs {
			configMap[entry.Name] = entry.Value
		}

		replicationFactor := 0
		if len(meta.Partitions) > 0 {
			replicationFactor = len(meta.Partitions[0].Replicas)
		}

		result = append(result, Topic{
			Name:              topicName,
			Partitions:        len(meta.Partitions),
			ReplicationFactor: replicationFactor,
			Internal:          meta.IsInternal,
			Config:            configMap,
		})
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].Name < result[j].Name
	})

	return result, nil
}

type CreateTopicRequest struct {
	Name              string            `json:"name"`
	Partitions        int32             `json:"partitions"`
	ReplicationFactor int16             `json:"replicationFactor"`
	Config            map[string]string `json:"config"`
}

func (s *KafkaService) CreateTopic(ctx context.Context, req CreateTopicRequest) error {
	topicDetail := &sarama.TopicDetail{
		NumPartitions:     req.Partitions,
		ReplicationFactor: req.ReplicationFactor,
		ConfigEntries:     make(map[string]*string),
	}

	for k, v := range req.Config {
		val := v
		topicDetail.ConfigEntries[k] = &val
	}

	return s.admin.CreateTopic(req.Name, topicDetail, false)
}

func (s *KafkaService) DeleteTopic(ctx context.Context, name string) error {
	return s.admin.DeleteTopic(name)
}

// Consumer Groups

type ConsumerGroup struct {
	GroupID       string           `json:"groupId"`
	State         string           `json:"state"`
	Protocol      string           `json:"protocol"`
	ProtocolType  string           `json:"protocolType"`
	Members       []ConsumerMember `json:"members"`
	CoordinatorID int32            `json:"coordinatorId"`
}

type ConsumerMember struct {
	MemberID   string `json:"memberId"`
	ClientID   string `json:"clientId"`
	ClientHost string `json:"clientHost"`
}

func (s *KafkaService) ListConsumerGroups(ctx context.Context) ([]ConsumerGroup, error) {
	groups, err := s.admin.ListConsumerGroups()
	if err != nil {
		return nil, err
	}

	groupIDs := make([]string, 0, len(groups))
	for groupID := range groups {
		groupIDs = append(groupIDs, groupID)
	}

	if len(groupIDs) == 0 {
		return []ConsumerGroup{}, nil
	}

	descriptions, err := s.admin.DescribeConsumerGroups(groupIDs)
	if err != nil {
		return nil, err
	}

	result := make([]ConsumerGroup, 0, len(descriptions))

	for _, desc := range descriptions {
		members := make([]ConsumerMember, 0, len(desc.Members))
		for _, member := range desc.Members {
			members = append(members, ConsumerMember{
				MemberID:   member.MemberId,
				ClientID:   member.ClientId,
				ClientHost: member.ClientHost,
			})
		}

		// Get coordinator for this group
		coordinator, err := s.client.Coordinator(desc.GroupId)
		coordinatorID := int32(-1)
		if err == nil && coordinator != nil {
			coordinatorID = coordinator.ID()
		}

		result = append(result, ConsumerGroup{
			GroupID:       desc.GroupId,
			State:         desc.State,
			Protocol:      desc.Protocol,
			ProtocolType:  desc.ProtocolType,
			Members:       members,
			CoordinatorID: coordinatorID,
		})
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].GroupID < result[j].GroupID
	})

	return result, nil
}

// Brokers

type Broker struct {
	ID   int32  `json:"id"`
	Host string `json:"host"`
	Port int32  `json:"port"`
	Rack string `json:"rack,omitempty"`
}

type BrokerConfig struct {
	Name      string `json:"name"`
	Value     string `json:"value"`
	IsDefault bool   `json:"isDefault"`
}

func (s *KafkaService) ListBrokers(ctx context.Context) ([]Broker, error) {
	brokers := s.client.Brokers()
	result := make([]Broker, 0, len(brokers))

	for _, broker := range brokers {
		result = append(result, Broker{
			ID:   broker.ID(),
			Host: broker.Addr(),
			Port: int32(9092), // Default port, adjust if needed
			Rack: broker.Rack(),
		})
	}

	return result, nil
}

func (s *KafkaService) GetBrokerConfig(ctx context.Context, brokerID int32) ([]BrokerConfig, error) {
	configEntries, err := s.admin.DescribeConfig(sarama.ConfigResource{
		Type: sarama.BrokerResource,
		Name: fmt.Sprintf("%d", brokerID),
	})
	if err != nil {
		return nil, err
	}

	result := make([]BrokerConfig, 0, len(configEntries))
	for _, entry := range configEntries {
		result = append(result, BrokerConfig{
			Name:      entry.Name,
			Value:     entry.Value,
			IsDefault: entry.Default,
		})
	}

	return result, nil
}

// Messages

type Message struct {
	Partition int64             `json:"partition"`
	Offset    int64             `json:"offset"`
	Key       string            `json:"key"`
	Value     string            `json:"value"`
	Timestamp string            `json:"timestamp"`
	Headers   map[string]string `json:"headers"`
}

func (s *KafkaService) GetMessages(ctx context.Context, topic string, partition int32, offset int64, limit int) ([]Message, error) {
	consumer, err := sarama.NewConsumerFromClient(s.client)
	if err != nil {
		return nil, fmt.Errorf("failed to create consumer: %w", err)
	}
	defer consumer.Close()

	partitionConsumer, err := consumer.ConsumePartition(topic, partition, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to consume partition: %w", err)
	}
	defer partitionConsumer.Close()

	messages := make([]Message, 0, limit)
	timeout := make(chan bool, 1)

	go func() {
		<-ctx.Done()
		timeout <- true
	}()

	for i := 0; i < limit; i++ {
		select {
		case msg := <-partitionConsumer.Messages():
			headers := make(map[string]string)
			for _, h := range msg.Headers {
				headers[string(h.Key)] = string(h.Value)
			}

			messages = append(messages, Message{
				Partition: int64(msg.Partition),
				Offset:    msg.Offset,
				Key:       string(msg.Key),
				Value:     string(msg.Value),
				Timestamp: msg.Timestamp.Format("2006-01-02T15:04:05Z07:00"),
				Headers:   headers,
			})
		case <-timeout:
			return messages, nil
		}
	}

	return messages, nil
}

type PublishResult struct {
	Topic     string `json:"topic"`
	Partition int32  `json:"partition"`
	Offset    int64  `json:"offset"`
	Success   bool   `json:"success"`
}

func (s *KafkaService) PublishMessage(ctx context.Context, topic string, key *string, value string, partition *int32) (*PublishResult, error) {
	producer, err := sarama.NewSyncProducerFromClient(s.client)
	if err != nil {
		return nil, fmt.Errorf("failed to create producer: %w", err)
	}
	defer producer.Close()

	msg := &sarama.ProducerMessage{
		Topic: topic,
		Value: sarama.StringEncoder(value),
	}

	if key != nil {
		msg.Key = sarama.StringEncoder(*key)
	}

	if partition != nil {
		msg.Partition = *partition
	}

	producedPartition, offset, err := producer.SendMessage(msg)
	if err != nil {
		return nil, fmt.Errorf("failed to send message: %w", err)
	}

	return &PublishResult{
		Topic:     topic,
		Partition: producedPartition,
		Offset:    offset,
		Success:   true,
	}, nil
}
