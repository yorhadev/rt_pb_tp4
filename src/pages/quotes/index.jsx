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
import { useNumberPattern } from "src/composables/patterns";

export default function Quotes() {
  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    reset,
  } = useForm();

  const [, setSnack, setSeverity] = useContext(SnackbarContext);

  const [loading, setLoading] = useState(false);

  const [key, setKey] = useState(0);

  const [render, setRender] = useState(0);

  const [quoteId, setQuoteId] = useState(null);

  const [quotes, setQuotes] = useState([]);

  const [purchaseRequestId, setPurchaseRequestId] = useState("");

  const [purchaseRequests, setPurchaseRequests] = useState([]);

  const [products, setProducts] = useState([]);

  const [supplierId, setSupplierId] = useState("");

  const [suppliers, setSuppliers] = useState([]);

  const [page, setPage] = useState(0);

  const rowsPerPage = 10;

  const updateFormFields = (data) => {
    Object.entries(data).map(([prop, value]) => setValue(prop, value));
    setQuoteId(data.id);
    setPurchaseRequestId(data.purchaseRequestId);
    setSupplierId(data.supplierId);
    setKey((state) => state + 1);
  };

  const formatData = (data) => {
    const formattedData = structuredClone(data);
    delete formattedData.id;
    delete formattedData.submittedDate;
    const purchaseRequest = findPurchaseRequest(data.purchaseRequestId);
    Object.assign(formattedData, { productId: purchaseRequest.productId });
    return formattedData;
  };

  const findPurchaseRequest = (purchaseRequestId) => {
    const purchaseRequest = purchaseRequests.find(
      (purchaseRequest) => purchaseRequest?.id === purchaseRequestId
    );
    return purchaseRequest;
  };

  const findProduct = (productId) => {
    const product = products.find((product) => product?.id === productId);
    return product?.name;
  };

  const findSupplier = (supplierId) => {
    const supplier = suppliers.find((supplier) => supplier?.id === supplierId);
    return supplier?.name;
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangePurchaseRequest = (event) => {
    setPurchaseRequestId(event.target.value);
  };

  const handleChangeSupplier = (event) => {
    setSupplierId(event.target.value);
  };

  const createDocument = async (data) => {
    setLoading(true);
    const documentData = formatData(data);
    const purchaseRequest = findPurchaseRequest(data.purchaseRequestId);
    if (purchaseRequest.quoteIds.length >= 3) {
      setSeverity("error");
      setSnack("cannot update purchase request after quote limit cap (3)!");
      setLoading(false);
      setRender((state) => state + 1);
      resetForm();
      return;
    }
    const response = await firebaseService.createDoc("quotes", documentData);
    const updatePurchaseResponse = await updatePurchaseRequest(response.data);
    if (updatePurchaseResponse.code !== 200) {
      setSeverity("error");
      setSnack(updatePurchaseResponse.message);
    } else {
      setSeverity(response.code === 200 ? "success" : "error");
      setSnack(response.message);
    }
    setLoading(false);
    setRender((state) => state + 1);
    resetForm();
  };

  const readDocuments = async (documentPath) => {
    const response = await firebaseService.findAllDocs(documentPath);
    if (response.code !== 200) return;
    if (documentPath === "quotes") setQuotes(response.data);
    if (documentPath === "purchaseRequests") setPurchaseRequests(response.data);
    if (documentPath === "products") setProducts(response.data);
    if (documentPath === "suppliers") setSuppliers(response.data);
  };

  const updateDocument = async (data) => {
    setLoading(true);
    const documentData = formatData(data);
    const response = await firebaseService.updateDocById(
      "quotes",
      quoteId,
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
    const response = await firebaseService.deleteDocById("quotes", documentId);
    const updatePurchaseResponse = await updatePurchaseRequest(data, "remove");
    if (updatePurchaseResponse.code !== 200) {
      setSeverity("error");
      setSnack(updatePurchaseResponse.message);
    } else {
      setSeverity(response.code === 200 ? "success" : "error");
      setSnack(response.message);
    }
    setLoading(false);
    setRender((state) => state + 1);
    resetForm();
  };

  const updatePurchaseRequest = async (quote, action = "add") => {
    if (!quote) {
      return {
        code: 400,
        message: "quote not found!",
        data: null,
      };
    }
    const purchaseRequest = structuredClone(
      findPurchaseRequest(quote.purchaseRequestId)
    );
    if (action === "add") {
      purchaseRequest.quoteIds.push(quote.id);
    }
    if (action === "remove") {
      purchaseRequest.quoteIds = purchaseRequest.quoteIds.filter(
        (quoteId) => quoteId !== quote.id
      );
    }
    if (purchaseRequest.quoteIds.length <= 0) {
      purchaseRequest.status = "open";
    }
    if (purchaseRequest.quoteIds.length >= 1) {
      purchaseRequest.status = "in quotation";
    }
    if (purchaseRequest.quoteIds.length >= 3) {
      purchaseRequest.status = "closed";
    }
    if (purchaseRequest.quoteIds.length >= 4) {
      return {
        code: 400,
        message: "cannot update purchase request after quote limit cap (3)!",
        data: null,
      };
    }
    const response = await firebaseService.updateDocById(
      "purchaseRequests",
      purchaseRequest.id,
      {
        status: purchaseRequest.status,
        quoteIds: purchaseRequest.quoteIds,
      }
    );
    return response;
  };

  const onSubmit = async (data) => {
    const request = quoteId ? updateDocument : createDocument;
    await request(data);
  };

  const resetForm = () => {
    reset();
    setQuoteId(null);
    setPurchaseRequestId("");
    setSupplierId("");
    setKey((state) => state + 1);
  };

  useEffect(() => {
    readDocuments("quotes");
    readDocuments("purchaseRequests");
    readDocuments("products");
    readDocuments("suppliers");
  }, [render]);

  return (
    <Box paddingTop="8rem">
      <Card sx={{ padding: "1rem" }}>
        <Typography component="h1" fontWeight="500">
          Quotes
          <Typography
            component="span"
            color="textSecondary"
            sx={{ marginLeft: "0.25rem" }}
          >
            {quoteId && "*update (clear to cancel)"}
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
            <FormControl size="small" error={Boolean(errors.purchaseRequestId)}>
              <InputLabel id="purchaseRequests">Purchase Requests</InputLabel>
              <Select
                labelId="purchaseRequests"
                label="Purchase Requests"
                size="small"
                {...register("purchaseRequestId", { required: true })}
                value={purchaseRequestId}
                onChange={handleChangePurchaseRequest}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {purchaseRequests.map((purchaseRequest) => (
                  <MenuItem key={purchaseRequest.id} value={purchaseRequest.id}>
                    {findProduct(purchaseRequest.productId)}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {errors.purchaseRequestId && "Field is required"}
              </FormHelperText>
            </FormControl>
            <FormControl size="small" error={Boolean(errors.supplierId)}>
              <InputLabel id="suppliers">Suppliers</InputLabel>
              <Select
                labelId="suppliers"
                label="Suppliers"
                size="small"
                {...register("supplierId", { required: true })}
                value={supplierId}
                onChange={handleChangeSupplier}
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
            <TextField
              key={`price-${key}`}
              label="Price"
              size="small"
              {...register("price", {
                required: true,
                pattern: useNumberPattern,
              })}
              helperText={errors.price && "Field should be a valid number"}
              error={Boolean(errors.price)}
              disabled={loading}
            />
          </Box>
          <Box className={styles.form_controls}>
            <Button type="submit" variant="contained">
              {quoteId ? "Update" : "Create"}
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
                <TableCell>Purchase Request</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">@</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quotes
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell>{findProduct(quote.productId)}</TableCell>
                    <TableCell>{findSupplier(quote.supplierId)}</TableCell>
                    <TableCell>{quote.price}</TableCell>
                    <TableCell>
                      {findPurchaseRequest(quote.purchaseRequestId)?.status}
                    </TableCell>
                    <TableCell>
                      {quote.submittedDate.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" justifyContent="center">
                        <Tooltip title="Update">
                          <IconButton onClick={() => updateFormFields(quote)}>
                            <Update />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => deleteDocument(quote)}>
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
            count={quotes.length}
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
