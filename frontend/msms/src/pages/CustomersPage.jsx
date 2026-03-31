import CrudPage from "../components/CrudPage";

export default function CustomersPage() {
  return (
    <CrudPage
      title="Customers"
      endpoint="/customers"
      fields={[
        { name: "name", label: "Name" },
        { name: "contact", label: "Contact" },
        { name: "address", label: "Address" },
      ]}
    />
  );
}
