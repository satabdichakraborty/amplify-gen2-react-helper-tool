import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "@cloudscape-design/global-styles/index.css";
import {
  Container,
  Header,
  Table,
  Button,
  SpaceBetween,
  Box,
  TextContent,
  Alert
} from '@cloudscape-design/components';
import { applyMode, Mode } from "@cloudscape-design/global-styles";
import { listItems, type Item } from '../graphql/operations';

// Apply light mode to match AWS Console
applyMode(Mode.Light);

interface ItemsListProps {
  title?: string;
}

export function ItemsList({ title = 'Items' }: ItemsListProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; details?: string } | null>(null);
  const navigate = useNavigate();
  const [filteringText, setFilteringText] = useState('');

  async function loadItems() {
    try {
      console.log('Loading items...');
      setLoading(true);
      setError(null);
      const data = await listItems();
      console.log('Items loaded:', data);
      setItems(data);
    } catch (err) {
      console.error('Error loading items:', err);
      setError({
        message: 'Error loading items',
        details: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  if (error) {
    return (
      <Alert type="error" header={error.message}>
        {error.details && <p>{error.details}</p>}
      </Alert>
    );
  }

  const filteredItems = items.filter(item =>
    filteringText === '' ||
    item.QuestionId.toLowerCase().includes(filteringText.toLowerCase()) ||
    item.stem.toLowerCase().includes(filteringText.toLowerCase())
  );

  return (
    <Container>
      <SpaceBetween size="l">
        <Header
          variant="h1"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={() => navigate('/items/new')}>Add new item</Button>
            </SpaceBetween>
          }
        >
          {title}
        </Header>

        <Table
          loading={loading}
          loadingText="Loading items"
          items={filteredItems}
          columnDefinitions={[
            {
              id: 'id',
              header: 'Question ID',
              cell: (item: Item) => item.QuestionId,
              sortingField: 'QuestionId'
            },
            {
              id: 'createdDate',
              header: 'Created Date',
              cell: (item: Item) => new Date(item.CreatedDate).toLocaleString(),
              sortingField: 'CreatedDate'
            },
            {
              id: 'question',
              header: 'Question',
              cell: (item: Item) => item.stem,
              sortingField: 'stem'
            },
            {
              id: 'correctAnswer',
              header: 'Correct Answer',
              cell: (item: Item) => item.correctResponse,
              sortingField: 'correctResponse'
            },
            {
              id: 'actions',
              header: 'Actions',
              cell: (item: Item) => (
                <Button onClick={() => navigate(`/items/${item.QuestionId}/edit`, {
                  state: { item }
                })}>
                  Edit
                </Button>
              )
            }
          ]}
          empty={
            <Box textAlign="center" color="inherit">
              <TextContent>
                <h3>No items</h3>
                <p>No items to display.</p>
              </TextContent>
            </Box>
          }
          filter={
            <TextContent>
              <input
                type="text"
                placeholder="Filter items"
                value={filteringText}
                onChange={(e) => setFilteringText(e.target.value)}
              />
            </TextContent>
          }
        />
      </SpaceBetween>
    </Container>
  );
} 