import { Delete, Update } from "@mui/icons-material";
import styles from "./styles.module.css";
import {
  Box,
  Button,
  Card,
  Divider,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { firebaseService } from "src/services/firebase";
import { SnackbarContext } from "src/contexts/snackbar";
import { useEmailPattern } from "src/composables/patterns";

export default function Contacts() {
  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    reset,
  } = useForm({ defaultValues: { supplierId: "" } });

  const [, setSnack, setSeverity] = useContext(SnackbarContext);

  const [loading, setLoading] = useState(false);

  const [key, setKey] = useState(0);

  const [render, setRender] = useState(0);

  const [contactId, setContactId] = useState(null);

  const [contacts, setContacts] = useState([]);

  const [supplierId, setSupplierId] = useState("");

  const [suppliers, setSuppliers] = useState([]);

  const [page, setPage] = useState(0);

  const rowsPerPage = 10;

  const updateFormFields = (data) => {
    Object.entries(data).map(([prop, value]) => setValue(prop, value));
    setContactId(data.id);
    setSupplierId(data.supplierId);
    setKey((state) => state + 1);
  };

  const formatData = (data) => {
    const formattedData = structuredClone(data);
    delete formattedData.id;
    delete formattedData.submittedDate;
    return formattedData;
  };

  const findSupplier = (supplierId) => {
    const supplier = suppliers.find((supplier) => supplier?.id === supplierId);
    return supplier?.name;
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeSelect = (event) => {
    setSupplierId(event.target.value);
  };

  const createDocument = async (data) => {
    setLoading(true);
    const documentData = formatData(data);
    const response = await firebaseService.createDoc("contacts", documentData);
    setSeverity(response.code === 200 ? "success" : "error");
    setSnack(response.message);
    setLoading(false);
    setRender((state) => state + 1);
    resetForm();
  };

  const readDocuments = async (documentPath) => {
    const response = await firebaseService.findAllDocs(documentPath);
    if (response.code !== 200) return;
    if (documentPath === "contacts") setContacts(response.data);
    if (documentPath === "suppliers") setSuppliers(response.data);
  };

  const updateDocument = async (data) => {
    setLoading(true);
    const documentData = formatData(data);
    const response = await firebaseService.updateDocById(
      "contacts",
      contactId,
      documentData
    );
    setSeverity(response.code === 200 ? "success" : "error");
    setSnack(response.message);
    setLoading(false);
    setRender((state) => state + 1);
    resetForm();
  };

  const deleteDocument = async (documentId) => {
    setLoading(true);
    const response = await firebaseService.deleteDocById(
      "contacts",
      documentId
    );
    setSeverity(response.code === 200 ? "success" : "error");
    setSnack(response.message);
    setLoading(false);
    setRender((state) => state + 1);
    resetForm();
  };

  const onSubmit = async (data) => {
    const request = contactId ? updateDocument : createDocument;
    await request(data);
  };

  const resetForm = () => {
    reset();
    setContactId(null);
    setSupplierId("");
    setKey((state) => state + 1);
  };

  useEffect(() => {
    readDocuments("contacts");
    readDocuments("suppliers");
  }, [render]);

  return (
    <Box paddingTop="8rem">
      <Card sx={{ padding: "1rem" }}>
        <Typography component="h1" fontWeight="500">
          Contacts
          <Typography
            component="span"
            color="textSecondary"
            sx={{ marginLeft: "0.25rem" }}
          >
            {contactId && "*update (clear to cancel)"}
          </Typography>
        </Typography>
        <Divider sx={{ margin: "1rem 0 1.5rem" }} />
        <Box
          className={styles.form_container}
          component="form"
          autoComplete="off"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <Box className={styles.form_fields}>
            <TextField
              key={`name-${key}`}
              label="Name"
              size="small"
              {...register("name", { required: true })}
              helperText={errors.name && "Field is required"}
              error={Boolean(errors.name)}
              disabled={loading}
            />
            <TextField
              key={`email-${key}`}
              label="Email"
              size="small"
              {...register("email", {
                required: true,
                pattern: useEmailPattern,
              })}
              helperText={errors.email && "Field is required"}
              error={Boolean(errors.email)}
              disabled={loading}
            />
            <FormControl size="small" error={Boolean(errors.supplierId)}>
              <InputLabel id="suppliers">Suppliers</InputLabel>
              <Select
                labelId="suppliers"
                label="Suppliers"
                size="small"
                {...register("supplierId", { required: true })}
                value={supplierId}
                onChange={handleChangeSelect}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {suppliers.map((supplier) => (
                  <MenuItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {errors.supplierId && "Field is required"}
              </FormHelperText>
            </FormControl>
          </Box>
          <Box className={styles.form_controls}>
            <Button type="submit" variant="contained">
              {contactId ? "Update" : "Create"}
            </Button>
            <Button type="reset" variant="outlined" onClick={resetForm}>
              Clear
            </Button>
          </Box>
        </Box>
      </Card>
      <Card sx={{ marginTop: "2rem", marginBottom: "2rem" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">@</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contacts
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>{contact.name}</TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{findSupplier(contact.supplierId)}</TableCell>
                    <TableCell>
                      {contact.submittedDate.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" justifyContent="center">
                        <Tooltip title="Update">
                          <IconButton onClick={() => updateFormFields(contact)}>
                            <Update />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => deleteDocument(contact.id)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box paddingInline="1.5rem">
          <TablePagination
            component="div"
            count={contacts.length}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[rowsPerPage]}
            onPageChange={handleChangePage}
          />
        </Box>
      </Card>
    </Box>
  );
}
