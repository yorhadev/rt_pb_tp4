import styles from "./styles.module.css";
import { Delete, Edit, Launch } from "@mui/icons-material";
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
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { firebaseService } from "src/services/firebase";
import { SnackbarContext } from "src/contexts/snackbar";
import { useNumberPattern } from "src/composables/patterns";
import { useNavigate } from "react-router-dom";
import { useExportToCSV } from "src/composables/exports";
import { AppQuotesModal } from "src/components";

export default function PurchaseRequests() {
  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    reset,
  } = useForm();

  const navigate = useNavigate();

  const [, setSnack, setSeverity] = useContext(SnackbarContext);

  const [loading, setLoading] = useState(false);

  const [key, setKey] = useState(0);

  const [render, setRender] = useState(0);

  const [purchaseRequestId, setPurchaseRequestId] = useState(null);

  const [purchaseRequests, setPurchaseRequests] = useState([]);

  const [productId, setProductId] = useState("");

  const [products, setProducts] = useState([]);

  const [userRole, setUserRole] = useState(null);

  const [page, setPage] = useState(0);

  const rowsPerPage = 10;

  const [order, setOrder] = useState("asc");

  const [open, setOpen] = useState(false);

  const updateFormFields = (data) => {
    Object.entries(data).map(([prop, value]) => setValue(prop, value));
    setPurchaseRequestId(data.id);
    setProductId(data.productId);
    setKey((state) => state + 1);
  };

  const formatData = (data) => {
    const formattedData = structuredClone(data);
    delete formattedData.id;
    delete formattedData.submittedDate;
    Object.assign(formattedData, { status: "open" });
    Object.assign(formattedData, { quoteIds: [] });
    return formattedData;
  };

  const findProduct = (productId) => {
    const product = products.find((product) => product?.id === productId);
    return product?.name;
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeSelect = (event) => {
    setProductId(event.target.value);
  };

  const createDocument = async (data) => {
    setLoading(true);
    const documentData = formatData(data);
    const response = await firebaseService.createDoc(
      "purchaseRequests",
      documentData
    );
    setSeverity(response.code === 200 ? "success" : "error");
    setSnack(response.message);
    setLoading(false);
    setRender((state) => state + 1);
    resetForm();
  };

  const readDocuments = async (documentPath) => {
    const response = await firebaseService.findAllDocs(documentPath);
    if (response.code !== 200) return;
    if (documentPath === "purchaseRequests") setPurchaseRequests(response.data);
    if (documentPath === "products") setProducts(response.data);
  };

  const updateDocument = async (data) => {
    setLoading(true);
    const documentData = formatData(data);
    const response = await firebaseService.updateDocById(
      "purchaseRequests",
      purchaseRequestId,
      documentData
    );
    setSeverity(response.code === 200 ? "success" : "error");
    setSnack(response.message);
    setLoading(false);
    setRender((state) => state + 1);
    resetForm();
  };

  const deleteDocument = async (data) => {
    setLoading(true);
    const documentId = data.id;
    const response = await firebaseService.deleteDocById(
      "purchaseRequests",
      documentId
    );
    const quoteRequests = [];
    data.quoteIds.map((quoteId) =>
      quoteRequests.push(firebaseService.deleteDocById("quotes", quoteId))
    );
    const quoteResponses = await Promise.all(quoteRequests);
    if (quoteResponses.find((resp) => resp.code !== 200)) {
      setSeverity("error");
      setSnack("failed to delete quotes linked to purchase request!");
    } else {
      setSeverity(response.code === 200 ? "success" : "error");
      setSnack(response.message);
    }
    setLoading(false);
    setRender((state) => state + 1);
    resetForm();
  };

  const onSubmit = async (data) => {
    const request = purchaseRequestId ? updateDocument : createDocument;
    await request(data);
  };

  const getCurrentUserRole = async () => {
    const userId = firebaseService.auth.currentUser.uid;
    const response = await firebaseService.findOneDoc("users", userId);
    if (response.code !== 200) return setUserRole("collaborator");
    return setUserRole(response.data?.role || "collaborator");
  };

  const resetForm = () => {
    reset();
    setPurchaseRequestId(null);
    setProductId("");
    setKey((state) => state + 1);
  };

  const createSortHandler = () => {
    const isAsc = order === "asc";
    setOrder(isAsc ? "desc" : "asc");
  };

  const getComparator = (order) => {
    return order === "desc"
      ? (a, b) => new Date(b.submittedDate) - new Date(a.submittedDate)
      : (a, b) => new Date(a.submittedDate) - new Date(b.submittedDate);
  };

  const handleClose = (event, reason) => {
    if (reason !== "backdropClick") {
      setOpen(false);
    }
  };

  useEffect(() => {
    readDocuments("purchaseRequests");
    readDocuments("products");
    if (!userRole) getCurrentUserRole();
  }, [render]);

  return (
    <Box paddingTop="8rem">
      <Card sx={{ padding: "1rem" }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography component="h1" fontWeight="500">
            Purchase Requests
            <Typography
              component="span"
              color="textSecondary"
              sx={{ marginLeft: "0.25rem" }}
            >
              {purchaseRequestId && "*update (clear to cancel)"}
            </Typography>
          </Typography>
          <Box>
            <Button
              color="secondary"
              variant="contained"
              onClick={(e) => useExportToCSV(purchaseRequests)}
            >
              Export
            </Button>
          </Box>
        </Box>
        <Divider sx={{ margin: "1rem 0 1.5rem" }} />
        <Box
          className={styles.form_container}
          component="form"
          autoComplete="off"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <Box className={styles.form_fields}>
            <FormControl size="small" error={Boolean(errors.productId)}>
              <InputLabel id="products">Products</InputLabel>
              <Select
                labelId="products"
                label="Products"
                size="small"
                {...register("productId", { required: true })}
                value={productId}
                onChange={handleChangeSelect}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {errors.productId && "Field is required"}
              </FormHelperText>
            </FormControl>
            <TextField
              key={`description-${key}`}
              label="Description"
              size="small"
              {...register("description", { required: true })}
              helperText={errors.description && "Field is required"}
              error={Boolean(errors.description)}
              disabled={loading}
            />
            <TextField
              key={`quantity-${key}`}
              label="Quantity"
              size="small"
              {...register("quantity", {
                required: true,
                pattern: useNumberPattern,
              })}
              helperText={errors.quantity && "Field should be a valid number"}
              error={Boolean(errors.quantity)}
              disabled={loading}
            />
          </Box>
          <Box className={styles.form_controls}>
            <Button type="submit" variant="contained">
              {purchaseRequestId ? "Update" : "Create"}
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
                <TableCell>Product</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Quotes</TableCell>
                <TableCell sortDirection={order}>
                  <TableSortLabel
                    active={true}
                    direction={order}
                    onClick={createSortHandler}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">@</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {purchaseRequests
                .sort(getComparator(order))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((purchaseRequest) => (
                  <TableRow key={purchaseRequest.id}>
                    <TableCell>
                      {findProduct(purchaseRequest.productId)}
                    </TableCell>
                    <TableCell>{purchaseRequest.description}</TableCell>
                    <TableCell>{purchaseRequest.quantity}</TableCell>
                    <TableCell>{purchaseRequest.status}</TableCell>
                    <TableCell>
                      {purchaseRequest.quoteIds?.length} / 3
                    </TableCell>
                    <TableCell>
                      {purchaseRequest.submittedDate.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" justifyContent="center">
                        {userRole === "admin" && (
                          <Tooltip title="Fulfill">
                            <IconButton
                              aria-label="fulfill"
                              onClick={() => setOpen(true)}
                            >
                              <Launch />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Update">
                          <IconButton
                            aria-label="update"
                            onClick={() => updateFormFields(purchaseRequest)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            aria-label="delete"
                            onClick={() => deleteDocument(purchaseRequest)}
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
            count={purchaseRequests.length}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[rowsPerPage]}
            onPageChange={handleChangePage}
          />
        </Box>
      </Card>
      <AppQuotesModal open={open} handleClose={handleClose} />
    </Box>
  );
}
