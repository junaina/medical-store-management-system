import CrudPage from "../components/CrudPage";

export default function SuppliersPage() {
  return (
    <CrudPage
      title="Suppliers"
      endpoint="/suppliers"
      fields={[
        { name: "name", label: "Name" },
        { name: "contact", label: "Contact" },
        { name: "address", label: "Address" },
      ]}
    />
  );
}
