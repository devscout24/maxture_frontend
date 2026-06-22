

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getPropertiesIndex,
	getPropertiesAll,
	getPropertyById,
	getPropertyTypes,
	getPropertyTypeOptions,
	getFilteredProperties,
	storeProperty,
	updatePropertyPrice,
	type PropertyDetailResponse,
	type PropertyIndexItem,
	type PropertyTypeOption,
	type FilteredPropertiesPayload,
	type StorePropertyPayload,
} from "@/lib/api";
import { toast } from "sonner";

export type PropertyFiltersPayload = {
  search?: string;
	property_type_id: number[];
	price_range: string;
	bedrooms?: number | null;
	bathrooms?: number | null;
};

type UsePropertiesResult = {
	properties: PropertyIndexItem[];
	propertyTypes: string[];
	loading: boolean;
	error: string | null;
	refresh: () => void;
	fetchPropertyById: (propertyId: string | number, token?: string) => Promise<PropertyDetailResponse>;
};

export default function useProperties(): UsePropertiesResult {
	const {
		data: propertiesData,
		isLoading: isLoadingProperties,
		error: propertiesError,
		refetch: refetchProperties,
	} = useQuery({
		queryKey: ["properties"],
		queryFn: getPropertiesIndex,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});

	const {
		data: typesData,
		isLoading: isLoadingTypes,
		error: typesError,
		refetch: refetchTypes,
	} = useQuery({
		queryKey: ["propertyTypes"],
		queryFn: getPropertyTypes,
		staleTime: 10 * 60 * 1000, // 10 minutes
	});

	const properties = propertiesData?.data?.properties ?? [];
	const propertyTypes =
		typesData?.data?.types ??
		typesData?.data?.property_types ??
		typesData?.data?.propertyTypes ??
		[];

	const loading = isLoadingProperties || isLoadingTypes;
	const error = propertiesError
		? (propertiesError instanceof Error ? propertiesError.message : "Failed to fetch properties")
		: typesError
		? (typesError instanceof Error ? typesError.message : "Failed to fetch property types")
		: null;

	const refresh = () => {
		void refetchProperties();
		void refetchTypes();
	};

	return {
		properties,
		propertyTypes,
		loading,
		error,
		refresh,
		fetchPropertyById: getPropertyById,
	};
}

export function useCreateProperty() {
	const queryClient = useQueryClient();

	const createMutation = useMutation({
		mutationFn: (payload: StorePropertyPayload) => storeProperty(payload),
		onSuccess: (data) => {
			toast.success(data.message || "Property created successfully");
			queryClient.invalidateQueries({ queryKey: ["properties"] });
		},
		onError: (error: any) => {
			toast.error(error.message || "Failed to create property");
		},
	});

	return {
		createProperty: createMutation.mutateAsync,
		isCreating: createMutation.isPending,
		error: createMutation.error,
	};
}

export function useUpdatePropertyPrice() {
	const queryClient = useQueryClient();

	const updateMutation = useMutation({
		mutationFn: ({ propertyId, newPrice }: { propertyId: string | number; newPrice: number }) =>
			updatePropertyPrice(propertyId, newPrice),
		onSuccess: (data) => {
			toast.success(data.message || "Price updated successfully");
			queryClient.invalidateQueries({ queryKey: ["properties"] });
		},
		onError: (error: any) => {
			toast.error(error.message || "Failed to update price");
		},
	});

	return {
		updatePrice: updateMutation.mutateAsync,
		isUpdating: updateMutation.isPending,
		error: updateMutation.error,
	};
}

export function useAllProperties() {
	const propertiesQuery = useQuery({
		queryKey: ["allProperties"],
		queryFn: getPropertiesAll,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	return {
		properties: propertiesQuery.data?.data?.properties ?? [],
		isLoading: propertiesQuery.isLoading,
		isError: propertiesQuery.isError,
		error: propertiesQuery.error,
		refetch: propertiesQuery.refetch,
	};
}

export function usePropertyTypeOptions() {
	const query = useQuery({
		queryKey: ["propertyTypeOptions"],
		queryFn: getPropertyTypeOptions,
		staleTime: 5 * 60 * 1000,
	});

	return {
		propertyTypeOptions: (query.data?.data?.property_types ?? []) as PropertyTypeOption[],
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}

export function useFilteredProperties(filters: PropertyFiltersPayload) {
	const payload: FilteredPropertiesPayload = {
		search: filters.search,
		property_type_id: filters.property_type_id,
		price_range: filters.price_range,
		bedrooms: filters.bedrooms,
		bathrooms: filters.bathrooms,
	};

	const query = useQuery({
		queryKey: ["filteredProperties", payload],
		queryFn: () => getFilteredProperties(payload),
		staleTime: 0,
		refetchOnMount: "always",
		refetchOnWindowFocus: false,
	});

	const propertiesArr = query.data?.data?.properties?.items ?? [];

	return {
		properties: propertiesArr,
		isLoading: query.isLoading,
		isError: query.isError,
		error: query.error,
		refetch: query.refetch,
	};
}




