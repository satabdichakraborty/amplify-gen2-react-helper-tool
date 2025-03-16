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
  Alert,
  Modal
} from '@cloudscape-design/components';
import { applyMode, Mode } from "@cloudscape-design/global-styles";
import { listItems, deleteItem, type Item } from '../graphql/operations';
import { BulkUpload } from './BulkUpload';

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
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);

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

  async function handleDelete(item: Item) {
    try {
      setLoading(true);
      await deleteItem(item.QuestionId, item.CreatedDate);
      await loadItems(); // Reload the list after deletion
      setDeleteModalVisible(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Error deleting item:', err);
      setError({
        message: 'Error deleting item',
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

  const filteredItems = items;

  type ColumnDefinition = {
    id: string;
    header: string;
    cell: (item: Item) => React.ReactNode;
    sortingField?: string;
  };

  const COLUMN_DEFINITIONS: ColumnDefinition[] = [
    {
      id: 'id',
      header: 'ID',
      cell: (item: Item) => item.QuestionId,
      sortingField: 'QuestionId'
    },
    {
      id: 'question',
      header: 'Question',
      cell: (item: Item) => item.Question,
      sortingField: 'Question'
    },
    {
      id: 'createdDate',
      header: 'Created Date',
      cell: (item: Item) => new Date(item.CreatedDate).toLocaleString(),
      sortingField: 'CreatedDate'
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (item: Item) => (
        <SpaceBetween direction="horizontal" size="xs">
          <Button onClick={() => navigate(`/items/${item.QuestionId}/edit`)}>
            Edit
          </Button>
          <Button onClick={() => {
            setItemToDelete(item);
            setDeleteModalVisible(true);
          }}>
            Delete
          </Button>
        </SpaceBetween>
      )
    }
  ];

  return (
    <Container>
      <SpaceBetween size="l">
        <Header
          variant="h1"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="normal" onClick={() => setUploadModalVisible(true)}>
                Upload Items
              </Button>
              <Button variant="primary" onClick={() => navigate('/items/new')}>
                Add new item
              </Button>
            </SpaceBetween>
          }
        >
          {title}
        </Header>

        <Table
          loading={loading}
          loadingText="Loading items"
          items={filteredItems}
          columnDefinitions={COLUMN_DEFINITIONS}
          empty={
            <Box textAlign="center" color="inherit">
              <TextContent>
                <h3>No items</h3>
                <p>No items to display.</p>
              </TextContent>
            </Box>
          }
          header={
            <Header
              counter={`(${filteredItems.length})`}
            >
              Items
            </Header>
          }
        />
      </SpaceBetween>

      <Modal
        visible={deleteModalVisible}
        onDismiss={() => {
          setDeleteModalVisible(false);
          setItemToDelete(null);
        }}
        header="Delete Item"
        data-testid="delete-modal"
        footer={
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={() => {
              setDeleteModalVisible(false);
              setItemToDelete(null);
            }}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => itemToDelete && handleDelete(itemToDelete)}>
              Delete
            </Button>
          </SpaceBetween>
        }
      >
        Are you sure you want to delete this item? This action cannot be undone.
      </Modal>

      <BulkUpload
        visible={uploadModalVisible}
        onDismiss={() => setUploadModalVisible(false)}
        onUploadComplete={loadItems}
      />
    </Container>
  );
} 