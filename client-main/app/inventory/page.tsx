import { redirect } from "next/navigation";

export default function InventoryPage() {
	redirect("/avatar-shop?tab=inventory");
}
