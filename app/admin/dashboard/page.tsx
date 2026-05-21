// Redirect — admin dashboard URL was wrong in the demo guide.
// The actual admin landing is at /admin. Keep this redirect so any link
// (or guide) pointing at /admin/dashboard still works.
import { redirect } from "next/navigation"

export default function AdminDashboardRedirect() {
  redirect("/admin")
}
