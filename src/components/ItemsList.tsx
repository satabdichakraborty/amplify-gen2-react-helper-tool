import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "@cloudscape-design/global-styles/index.css";

// Cloudscape components
import AppLayout from "@cloudscape-design/components/app-layout";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import Button from "@cloudscape-design/components/button";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import Pagination from "@cloudscape-design/components/pagination";
import Box from "@cloudscape-design/components/box";
import Alert from "@cloudscape-design/components/alert";
import Container from "@cloudscape-design/components/container";
import { applyMode, Mode } from "@cloudscape-design/global-styles";

// Apply light mode to match AWS Console
applyMode(Mode.Light);

// Mock data for demonstration
const mockItems = [
  { id: "q-123456", content: "What is the capital of France?", createdAt: new Date().toISOString(), status: "Active" },
  { id: "q-234567", content: "Who wrote Romeo and Juliet?", createdAt: new Date().toISOString(), status: "Active" },
  { id: "q-345678", content: "What is the formula for water?", createdAt: new Date().toISOString(), status: "Active" }
];

export function ItemsList() {
  const navigate = useNavigate();
  const [items, setItems] = useState(mockItems);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());
  const [filteringText, setFilteringText] = useState<string>("");
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [loading, setLoading] = useState(false);

  // Create new item
  function createNewItem() {
    navigate('/items/new');
  }

  // Refresh items list
  function refreshItems() {
    setLoading(true);
    setLastRefreshed(new Date().toLocaleTimeString());
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }

  // Delete selected items
  function deleteSelected() {
    if (selectedItems.length === 0) return;
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const remainingItems = items.filter(
        item => !selectedItems.some(selected => selected.id === item.id)
      );
      setItems(remainingItems);
      setSelectedItems([]);
      setLoading(false);
    }, 1000);
  }

  // Filter items based on search text
  const filteredItems = filteringText 
    ? items.filter(item => 
        item.id.toLowerCase().includes(filteringText.toLowerCase()) || 
        (item.content && item.content.toLowerCase().includes(filteringText.toLowerCase()))
      )
    : items;

  // Table column definitions
  const columnDefinitions = [
    {
      id: "id",
      header: "Question ID",
      cell: (item: any) => item.id,
      sortingField: "id"
    },
    {
      id: "createdAt",
      header: "Created Date",
      cell: (item: any) => new Date(item.createdAt).toLocaleString(),
      sortingField: "createdAt"
    },
    {
      id: "content",
      header: "Stem",
      cell: (item: any) => item.content || "",
      sortingField: "content"
    },
    {
      id: "status",
      header: "Status",
      cell: () => "Active",
      sortingField: "status"
    },
    {
      id: "edit",
      header: "",
      cell: (item: any) => (
        <Button
          onClick={() => navigate(`/items/${item.id}/edit`)}
          variant="normal"
          iconName="edit"
        >
          Edit
        </Button>
      )
    }
  ];

  // Empty state component
  const emptyState = (
    <Box margin={{ vertical: 'xxxl' }} textAlign="center" color="inherit">
      <Box variant="strong" fontSize="heading-l" padding={{ bottom: 's' }} color="inherit">
        No items yet
      </Box>
      <Box variant="p" fontSize="body-m" padding={{ bottom: 'l' }} color="inherit">
        Get started by creating your first item
      </Box>
      <Button
        variant="primary"
        iconName="add-plus"
        onClick={createNewItem}
      >
        Create first item
      </Button>
    </Box>
  );

  return (
    <AppLayout
      content={
        <SpaceBetween size="l">
          {error && (
            <Alert type="error" dismissible onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          <Container>
            <SpaceBetween size="l">
              <Header
                variant="h1"
                actions={
                  <SpaceBetween direction="horizontal" size="xs">
                    <Button onClick={refreshItems}>Refresh</Button>
                    <Button variant="primary" onClick={createNewItem}>Create new item</Button>
                    <Button 
                      disabled={selectedItems.length === 0}
                      onClick={deleteSelected}
                    >
                      Delete selected
                    </Button>
                  </SpaceBetween>
                }
              >
                Items ({items.length})
              </Header>
              
              <TextFilter
                filteringText={filteringText}
                filteringPlaceholder="Search by Question ID or stem"
                filteringAriaLabel="Filter items"
                onChange={({ detail }) => setFilteringText(detail.filteringText)}
              />
              
              <Table
                columnDefinitions={columnDefinitions}
                items={filteredItems}
                loading={loading}
                loadingText="Loading items"
                selectionType="multi"
                selectedItems={selectedItems}
                onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
                empty={emptyState}
                header={
                  <Header
                    counter={`(${filteredItems.length})`}
                    description={`Last refreshed: ${lastRefreshed}`}
                  >
                    Items
                  </Header>
                }
                pagination={
                  <Pagination
                    currentPageIndex={currentPageIndex}
                    onChange={({ detail }) => setCurrentPageIndex(detail.currentPageIndex)}
                    pagesCount={Math.max(1, Math.ceil(filteredItems.length / 10))}
                    ariaLabels={{
                      nextPageLabel: "Next page",
                      previousPageLabel: "Previous page",
                      pageLabel: pageNumber => `Page ${pageNumber} of ${Math.ceil(filteredItems.length / 10)}`
                    }}
                  />
                }
                variant="full-page"
                stickyHeader
                stripedRows
              />
            </SpaceBetween>
          </Container>
        </SpaceBetween>
      }
      breadcrumbs={
        <BreadcrumbGroup
          items={[
            { text: "Home", href: "/" }
          ]}
          ariaLabel="Breadcrumbs"
        />
      }
      navigationHide
      toolsHide
      contentType="table"
    />
  );
} 