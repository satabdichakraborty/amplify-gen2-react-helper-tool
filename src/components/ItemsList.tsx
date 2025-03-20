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
  Modal,
  Toggle,
  Pagination,
  CollectionPreferences,
  Checkbox
} from '@cloudscape-design/components';
import { applyMode, Mode } from "@cloudscape-design/global-styles";
import { listItems, deleteItem, type Item } from '../graphql/operations';
import { BulkUpload } from './BulkUpload';
import { ItemDetails } from './ItemDetails';
import awsLogo from '../assets/aws-logo.png';

// Apply light mode to match AWS Console
applyMode(Mode.Light);

interface ItemsListProps {
  title?: string;
}

// Define available columns for table display
const AVAILABLE_COLUMNS = {
  selection: { id: "selection", label: "Selection" },
  id: { id: "id", label: "ID" },
  question: { id: "question", label: "Question" },
  type: { id: "type", label: "Type" },
  status: { id: "status", label: "Status" },
  key: { id: "key", label: "Correct Answer" },
  topic: { id: "topic", label: "Topic" },
  skills: { id: "skills", label: "Knowledge/Skills" },
  createdDate: { id: "createdDate", label: "Created Date" },
  createdBy: { id: "createdBy", label: "Created By" },
  actions: { id: "actions", label: "Actions" },
};

// Default visible columns
const DEFAULT_VISIBLE_COLUMNS = ['selection', 'id', 'question', 'type', 'status', 'createdDate', 'actions'];

// Default preference settings
const DEFAULT_PREFERENCES = {
  pageSize: 10,
  visibleContent: DEFAULT_VISIBLE_COLUMNS
};

export function ItemsList({ }: ItemsListProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; details?: string } | null>(null);
  const navigate = useNavigate();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [wrapQuestions, setWrapQuestions] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState<boolean>(false);
  // States for bulk delete
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [bulkDeleteModalVisible, setBulkDeleteModalVisible] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  
  // Sorting state
  const [sortingColumn, setSortingColumn] = useState<{
    sortingField?: string;
    sortingDirection: 'ascending' | 'descending';
  }>({
    sortingField: 'QuestionId',
    sortingDirection: 'ascending'
  });

  async function loadItems() {
    try {
      console.log('Loading items...');
      setLoading(true);
      setError(null);
      const data = await listItems();
      
      // Verify that data is an array
      if (!Array.isArray(data)) {
        console.error('Invalid response from listItems:', data);
        setError({
          message: 'Error loading items',
          details: 'Invalid response format from the server. Expected an array of items.'
        });
        return;
      }
      
      console.log(`Items loaded successfully: ${data.length} items`);
      
      // Log a few items for debugging (if any exist)
      if (data.length > 0) {
        console.log('Sample items:', data.slice(0, 3));
      } else {
        console.log('No items found in the database.');
      }
      
      setItems(data);
      setCurrentPage(1); // Reset to first page when new data is loaded
      // Clear selected items when reloading
      setSelectedItems([]);
    } catch (err) {
      console.error('Error loading items:', err);
      
      let errorDetails = err instanceof Error ? err.message : String(err);
      let errorAction = '';
      
      // Check for specific error types and provide helpful guidance
      if (errorDetails.includes('Network Error') || errorDetails.includes('Failed to fetch')) {
        errorAction = 'Please check your internet connection and make sure the API endpoint is accessible.';
      } else if (errorDetails.includes('Unauthorized') || errorDetails.includes('Forbidden')) {
        errorAction = 'Please check your API key and permissions.';
      }
      
      setError({
        message: 'Error loading items',
        details: `${errorDetails}${errorAction ? ' ' + errorAction : ''}`
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

  // Function to handle bulk delete
  async function handleBulkDelete() {
    try {
      setLoading(true);
      // Delete each selected item sequentially 
      for (const item of selectedItems) {
        await deleteItem(item.QuestionId, item.CreatedDate);
      }
      await loadItems(); // Reload the list after all deletions
      setBulkDeleteModalVisible(false);
      setSelectedItems([]);
    } catch (err) {
      console.error('Error performing bulk delete:', err);
      setError({
        message: 'Error deleting items',
        details: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setLoading(false);
    }
  }

  // Toggle single item selection
  const toggleItemSelection = (item: Item) => {
    setSelectedItems(prevSelectedItems => {
      const isSelected = prevSelectedItems.some(
        selected => selected.QuestionId === item.QuestionId && selected.CreatedDate === item.CreatedDate
      );
      
      if (isSelected) {
        return prevSelectedItems.filter(
          selected => !(selected.QuestionId === item.QuestionId && selected.CreatedDate === item.CreatedDate)
        );
      } else {
        return [...prevSelectedItems, item];
      }
    });
  };

  // Check if an item is selected
  const isItemSelected = (item: Item): boolean => {
    return selectedItems.some(
      selected => selected.QuestionId === item.QuestionId && selected.CreatedDate === item.CreatedDate
    );
  };

  // Toggle all items on current page
  const toggleAllItems = (checked: boolean) => {
    if (checked) {
      // Add all items from current page that aren't already selected
      const newSelectedItems = [...selectedItems];
      paginatedItems.forEach(item => {
        if (!isItemSelected(item)) {
          newSelectedItems.push(item);
        }
      });
      setSelectedItems(newSelectedItems);
    } else {
      // Remove all items from current page
      const itemsToKeep = selectedItems.filter(selectedItem => 
        !paginatedItems.some(
          pageItem => pageItem.QuestionId === selectedItem.QuestionId && pageItem.CreatedDate === selectedItem.CreatedDate
        )
      );
      setSelectedItems(itemsToKeep);
    }
  };

  // Check if all items on current page are selected
  const areAllItemsSelected = (): boolean => {
    return paginatedItems.length > 0 && paginatedItems.every(item => isItemSelected(item));
  };

  useEffect(() => {
    loadItems();
  }, []);

  // Load preferences from localStorage on initial render
  useEffect(() => {
    const savedPreferences = localStorage.getItem('itemListPreferences');
    if (savedPreferences) {
      try {
        const parsedPreferences = JSON.parse(savedPreferences);
        setPreferences(parsedPreferences);
        setPageSize(parsedPreferences.pageSize || 10);
      } catch (e) {
        console.error('Error parsing saved preferences:', e);
      }
    }
  }, []);

  if (error) {
    return (
      <Alert type="error" header={error.message}>
        {error.details && <p>{error.details}</p>}
      </Alert>
    );
  }
  
  // Sort items
  const sortedItems = [...items].sort((a, b) => {
    if (!sortingColumn.sortingField) {
      return 0;
    }
    
    const field = sortingColumn.sortingField as keyof Item;
    
    // Handle special case for nested fields or computed values
    if (field === 'QuestionId') {
      if (sortingColumn.sortingDirection === 'ascending') {
        return a.QuestionId - b.QuestionId;
      } else {
        return b.QuestionId - a.QuestionId;
      }
    }
    
    // Generic sorting for string fields
    const aValue = String(a[field] || '');
    const bValue = String(b[field] || '');
    
    if (sortingColumn.sortingDirection === 'ascending') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedItems.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = sortedItems.slice(startIndex, startIndex + pageSize);

  type ColumnDefinition = {
    id: string;
    header: string | React.ReactNode;
    cell: (item: Item) => React.ReactNode;
    sortingField?: string;
  };

  const COLUMN_DEFINITIONS: ColumnDefinition[] = [
    {
      id: 'selection',
      header: (
        <Checkbox
          checked={areAllItemsSelected()}
          onChange={({ detail }) => toggleAllItems(detail.checked)}
          ariaLabel="Select all items"
        />
      ),
      cell: (item: Item) => (
        <Checkbox
          checked={isItemSelected(item)}
          onChange={() => toggleItemSelection(item)}
          ariaLabel={`Select item ${item.QuestionId}`}
        />
      )
    },
    {
      id: 'id',
      header: 'ID',
      cell: (item: Item) => item.QuestionId,
      sortingField: 'QuestionId'
    },
    {
      id: 'question',
      header: (
        <SpaceBetween direction="horizontal" size="xs" alignItems="center">
          Question
          <Toggle
            checked={wrapQuestions}
            onChange={({ detail }) => setWrapQuestions(detail.checked)}
            ariaLabel="Toggle text wrapping for questions"
          />
        </SpaceBetween>
      ),
      cell: (item: Item) => (
        <div style={{ 
          maxWidth: '400px', 
          overflow: 'hidden', 
          textOverflow: wrapQuestions ? 'clip' : 'ellipsis', 
          whiteSpace: wrapQuestions ? 'normal' : 'nowrap',
          position: 'relative',
          wordBreak: wrapQuestions ? 'break-word' : 'normal',
          lineHeight: wrapQuestions ? '1.4' : 'inherit',
          maxHeight: wrapQuestions ? '100px' : 'none',
          overflowY: wrapQuestions ? 'auto' : 'hidden'
        }} 
        title={wrapQuestions ? '' : item.Question} // Show tooltip only in non-wrapped mode
        >
          {item.Question}
        </div>
      ),
      sortingField: 'Question'
    },
    {
      id: 'type',
      header: 'Type',
      cell: (item: Item) => item.Type || 'N/A',
      sortingField: 'Type'
    },
    {
      id: 'status',
      header: 'Status',
      cell: (item: Item) => item.Status || 'N/A',
      sortingField: 'Status'
    },
    {
      id: 'key',
      header: 'Correct Answer',
      cell: (item: Item) => item.Key || 'N/A',
      sortingField: 'Key'
    },
    {
      id: 'topic',
      header: 'Topic',
      cell: (item: Item) => item.Topic || 'N/A',
      sortingField: 'Topic'
    },
    {
      id: 'skills',
      header: 'Knowledge/Skills',
      cell: (item: Item) => item.KnowledgeSkills || 'N/A',
      sortingField: 'KnowledgeSkills'
    },
    {
      id: 'createdDate',
      header: 'Created Date',
      cell: (item: Item) => new Date(item.CreatedDate).toLocaleString(),
      sortingField: 'CreatedDate'
    },
    {
      id: 'createdBy',
      header: 'Created By',
      cell: (item: Item) => item.CreatedBy || 'N/A',
      sortingField: 'CreatedBy'
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (item: Item) => (
        <SpaceBetween direction="horizontal" size="xs">
          <Button onClick={() => {
            setSelectedItem(item);
            setDetailsModalVisible(true);
          }}>
            View
          </Button>
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

  // Manage collection preferences
  const handlePreferencesChange = ({ detail }: any) => {
    const newPreferences = { ...detail };
    setPreferences(newPreferences);
    
    // Save preferences to localStorage
    try {
      localStorage.setItem('itemListPreferences', JSON.stringify(newPreferences));
    } catch (e) {
      console.error('Error saving preferences to localStorage:', e);
    }
    
    if (detail.pageSize !== pageSize) {
      setPageSize(detail.pageSize);
      setCurrentPage(1); // Reset to first page when page size changes
    }
  };
  
  // Handle sorting
  const handleSortingChange = ({ detail }: any) => {
    setSortingColumn(detail);
  };

  return (
    <Container>
      <SpaceBetween size="l">
        <div style={{ display: 'flex', alignItems: 'center', padding: '20px 0' }}>
          <img src={awsLogo} alt="AWS Logo" style={{ height: '60px', marginRight: '20px' }} />
          <Header variant="h1">
            AWS Certification Helper Tool
          </Header>
        </div>

        <Header
          variant="h2"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button 
                variant="normal" 
                disabled={selectedItems.length === 0}
                onClick={() => setBulkDeleteModalVisible(true)}
              >
                Delete Selected ({selectedItems.length})
              </Button>
              <Button variant="normal" onClick={() => setUploadModalVisible(true)}>
                Upload Items
              </Button>
              <Button variant="primary" onClick={() => navigate('/items/new')}>
                Add new item
              </Button>
            </SpaceBetween>
          }
        >
          Questions Database
        </Header>

        <Table
          loading={loading}
          loadingText="Loading items"
          items={paginatedItems}
          columnDefinitions={COLUMN_DEFINITIONS}
          visibleColumns={preferences.visibleContent}
          sortingColumn={sortingColumn}
          sortingDisabled={false}
          onSortingChange={handleSortingChange}
          selectedItems={selectedItems}
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
              counter={`(${items.length})`}
              actions={
                <SpaceBetween direction="horizontal" size="xs">
                  <Button
                    iconName="refresh"
                    onClick={loadItems}
                    ariaLabel="Refresh table"
                  />
                </SpaceBetween>
              }
            >
              Certification Questions
            </Header>
          }
          pagination={
            <Pagination 
              currentPageIndex={currentPage}
              pagesCount={totalPages}
              onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
              ariaLabels={{
                nextPageLabel: 'Next page',
                previousPageLabel: 'Previous page',
                pageLabel: pageNumber => `Page ${pageNumber} of all pages`
              }}
            />
          }
          preferences={
            <CollectionPreferences
              title="Preferences"
              confirmLabel="Confirm"
              cancelLabel="Cancel"
              preferences={preferences}
              onConfirm={handlePreferencesChange}
              pageSizePreference={{
                title: "Items per page",
                options: [
                  { value: 10, label: "10 items" },
                  { value: 20, label: "20 items" },
                  { value: 50, label: "50 items" }
                ]
              }}
              visibleContentPreference={{
                title: "Select visible columns",
                options: [
                  {
                    label: "Item properties",
                    options: [
                      AVAILABLE_COLUMNS.selection,
                      AVAILABLE_COLUMNS.id,
                      AVAILABLE_COLUMNS.question,
                      AVAILABLE_COLUMNS.type,
                      AVAILABLE_COLUMNS.status,
                      AVAILABLE_COLUMNS.key,
                      AVAILABLE_COLUMNS.topic,
                      AVAILABLE_COLUMNS.skills,
                      AVAILABLE_COLUMNS.createdDate,
                      AVAILABLE_COLUMNS.createdBy,
                      AVAILABLE_COLUMNS.actions
                    ]
                  }
                ]
              }}
            />
          }
        />
      </SpaceBetween>

      <ItemDetails 
        item={selectedItem}
        visible={detailsModalVisible}
        onDismiss={() => setDetailsModalVisible(false)}
      />

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

      {/* Bulk Delete Modal */}
      <Modal
        visible={bulkDeleteModalVisible}
        onDismiss={() => setBulkDeleteModalVisible(false)}
        header="Delete Selected Items"
        data-testid="bulk-delete-modal"
        footer={
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={() => setBulkDeleteModalVisible(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleBulkDelete}>
              Delete {selectedItems.length} items
            </Button>
          </SpaceBetween>
        }
      >
        Are you sure you want to delete {selectedItems.length} selected items? This action cannot be undone.
      </Modal>

      <BulkUpload
        visible={uploadModalVisible}
        onDismiss={() => setUploadModalVisible(false)}
        onUploadComplete={loadItems}
      />
    </Container>
  );
} 