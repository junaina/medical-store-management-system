import CrudPage from "../components/CrudPage";

export default function MedicinesPage() {
  return (
    <CrudPage
      title="Medicines"
      endpoint="/medicines"
      fields={[
        { name: "name", label: "Name" },
        { name: "category", label: "Category" },
        { name: "batch_number", label: "Batch Number" },
        { name: "expiry_date", label: "Expiry Date", type: "date" },
        { name: "price", label: "Price", type: "number" },
        { name: "quantity", label: "Quantity", type: "number" },
      ]}
    />
  );
}
