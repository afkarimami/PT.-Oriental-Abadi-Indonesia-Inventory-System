export type InventoryItemType = "consumable" | "inventory" | "unclassified";

export type InventoryParams = {
  search?: string;
  page?: string;
  pageSize?: string;
  type?: InventoryItemType;
  rack?: string;
};

export type InventoryItem = {
  id: string;
  code: string;
  name: string;
  itemType: InventoryItemType;
  initialQuantity: number | null;
  usedQuantity: number | null;
  addedQuantity: number | null;
  currentQuantity: number | null;
  sourceNote: string | null;
  isActive: boolean;
  rack: { code: string; name: string };
};

export type InventorySearchItem = {
  id: string;
  code: string;
  name: string;
  rackId: string;
  rackCode: string;
  itemType: InventoryItemType;
  currentQuantity: number | null;
};

export type InventoryStockExportItem = {
  code: string;
  name: string;
  rackCode: string;
  itemType: InventoryItemType;
  initialQuantity: number | null;
  usedQuantity: number | null;
  addedQuantity: number | null;
  currentQuantity: number | null;
};
export type InventoryPagination = {
  page: number;
  pageSize: number;
  total: number;
};

export type InventoryRackSummary = {
  id: string;
  code: string;
  name: string;
  locationName: string;
  itemCount: number;
  totalQuantity: number;
  missingQuantityItems: number;
};

export type InventoryRackDetail = Pick<InventoryRackSummary, "id" | "code" | "name" | "locationName">;