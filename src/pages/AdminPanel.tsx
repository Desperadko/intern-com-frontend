import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import api, { emailTemplates } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { User } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
interface Template {
  subject: string;
  message: string;
}

export function AdminPanel() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [acceptedTemplate, setAcceptedTemplate] = useState<Template | null>(null);
  const [rejectedTemplate, setRejectedTemplate] = useState<Template | null>(null);
  const [, setError] = useState<string | null>(null);
  const [, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const acceptedResponse = await emailTemplates.get("accepted");
        setAcceptedTemplate(acceptedResponse.data);

        const rejectedResponse = await emailTemplates.get("rejected");
        setRejectedTemplate(rejectedResponse.data);
      } catch (err) {
        setError("Error fetching templates.");
        console.error("Error fetching templates:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const [editingTemplate, setEditingTemplate] = useState<"accepted" | "rejected" | null>(null);
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleSave = async (templateType: "accepted" | "rejected") => {
    const updatedTemplate: Template = { subject, message };
 
    try{
      const response = await emailTemplates.save(templateType, updatedTemplate);
      console.log(response.data);

      toast({
        title: `Template saved successfully`,
        description: `${templateType} template has been updated`,
        variant: `default`,
      });
      
      if(templateType === "accepted"){
        setAcceptedTemplate(updatedTemplate);
      }
      else{
        setRejectedTemplate(updatedTemplate);
      }

      setEditingTemplate(null);
    }
    catch(e){
      console.error("Error saving template: ", e);
      
      toast({
        title: `Error saving template`,
        description: `Please try again later`,
        variant: `destructive`,
      });
    }
  };
  const openEditModal = (template: Template, type: "accepted" | "rejected") => {
    setSubject(template.subject);
    setMessage(template.message);
    setEditingTemplate(type);
  };
  const closeModal = () => {
    setEditingTemplate(null);
  };
  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      const sortedUsers = response.data.sort((a: User, b: User) => a.id - b.id);
      setUsers(sortedUsers);
      setFilteredUsers(sortedUsers);
    } catch (error) {
      toast({
        title: t("adminPanel.error"),
        description: t("adminPanel.fetchError"),
        variant: "destructive",
      });
    }
  };

  const updateUserRole = async (userId: number, newRole: string) => {
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      toast({
        title: t("adminPanel.success"),
        description: t("adminPanel.roleUpdated"),
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: t("adminPanel.error"),
        description: t("adminPanel.roleUpdateError"),
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      await api.delete(`/users/${userId}`);
      toast({
        title: t("adminPanel.success"),
        description: t("adminPanel.userDeleted"),
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: t("adminPanel.error"),
        description: t("adminPanel.userDeleteError"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("adminPanel.userManagement")}</h1>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("adminPanel.searchPlaceholder")}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("adminPanel.name")}</TableHead>
              <TableHead>{t("adminPanel.email")}</TableHead>
              <TableHead>{t("adminPanel.role")}</TableHead>
              <TableHead>{t("adminPanel.company")}</TableHead>
              <TableHead>{t("adminPanel.phone")}</TableHead>
              <TableHead>{t("adminPanel.joined")}</TableHead>
              <TableHead>{t("adminPanel.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select
                    defaultValue={user.role}
                    onValueChange={(value) => updateUserRole(user.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="candidate">{t("adminPanel.candidate")}</SelectItem>
                      <SelectItem value="partner">{t("adminPanel.partner")}</SelectItem>
                      <SelectItem value="admin">{t("adminPanel.admin")}</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{user.companyName || "-"}</TableCell>
                <TableCell>{user.phoneNumber || "-"}</TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" onClick={() => setUserToDelete(user)}>
                        {t("adminPanel.delete")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("adminPanel.confirmDeleteTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("adminPanel.confirmDeleteDescription")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("adminPanel.cancel")}</AlertDialogCancel>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            if (userToDelete) {
                              deleteUser(userToDelete.id);
                            }
                          }}
                        >
                          {t("adminPanel.delete")}
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="max-w-2x1 mx-auto mt-8">
        <Card>
          <CardHeader className="text-xl font-bold">Mail Templates</CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              {acceptedTemplate && (
                <div className="flex flex-col">
                  <h2 className="text-lg font-semibold mb-2">Accepted Template</h2>
                  <p className="font-medium mb-2">
                    <strong>Subject:</strong> {acceptedTemplate.subject}
                  </p>
                  <p className="mb-2">
                    <strong>Body:</strong> {acceptedTemplate.message}
                  </p>
                  <Button
                    onClick={() => openEditModal(acceptedTemplate, "accepted")}
                    className="bg-blue-500 text-white"
                  >
                    Edit Accepted Template
                  </Button>
                </div>
              )}

              {rejectedTemplate && (
                <div className="flex flex-col">
                  <h2 className="text-lg font-semibold mb-2">Rejected Template</h2>
                  <p className="font-medium mb-2">
                    <strong>Subject:</strong> {rejectedTemplate.subject}
                  </p>
                  <p className="mb-2">
                    <strong>Body:</strong> {rejectedTemplate.message}
                  </p>
                  <Button
                    onClick={() => openEditModal(rejectedTemplate, "rejected")}
                    className="bg-blue-500 text-white"
                  >
                    Edit Rejected Template
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {editingTemplate && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
            <div className="bg-white dark:bg-gray-900 text-black dark:text-white p-8 rounded-md shadow-lg w-1/2 flex flex-col">
              <h2 className="text-xl font-semibold mb-4">Edit Template</h2>
              <div className="mb-4">
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  Subject:
                </label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message (Body):
                </label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  className="w-full bg-gray-100 dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600"
                />
              </div>
              <div className="mt-auto flex justify-between space-x-2">
                <Button
                  onClick={() => handleSave(editingTemplate)}
                  className="bg-blue-500 text-white w-full sm:w-auto"
                >
                  Save Template
                </Button>
                <Button onClick={closeModal} className="bg-gray-500 text-white w-full sm:w-auto">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
