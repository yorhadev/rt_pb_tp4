import { Delete, Edit } from "@mui/icons-material";
import styles from "./styles.module.css";
import {
  Box,
  Button,
  Card,
  Divider,
  IconButton,
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

export default function Products() {
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

  const [productId, setProductId] = useState(null);

  const [products, setProducts] = useState([]);

  const [page, setPage] = useState(0);

  const rowsPerPage = 10;

  const updateFormFields = (data) => {
    Object.entries(data).map(([prop, value]) => setValue(prop, value));
    setProductId(data.id);
    setKey((state) => state + 1);
  };

  const formatData = (data) => {
    const formattedData = structuredClone(data);
    delete formattedData.id;
    delete formattedData.submittedDate;
    return formattedData;
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const createDocument = async (data) => {
    setLoading(true);
    const documentData = formatData(data);
    const response = await firebaseService.createDoc("products", documentData);
    setSeverity(response.code === 200 ? "success" : "error");
    setSnack(response.message);
    setLoading(false);
    setRender((state) => state + 1);
    resetForm();
  };

  const readDocuments = async () => {
    const response = await firebaseService.findAllDocs("products");
    if (response.code === 200) setProducts(response.data);
  };

  const updateDocument = async (data) => {
    setLoading(true);
    const documentData = formatData(data);
    const response = await firebaseService.updateDocById(
      "products",
      productId,
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
      "products",
      documentId
    );
    setSeverity(response.code === 200 ? "success" : "error");
    setSnack(response.message);
    setLoading(false);
    setRender((state) => state + 1);
    resetForm();
  };

  const onSubmit = async (data) => {
    const request = productId ? updateDocument : createDocument;
    await request(data);
  };

  const resetForm = () => {
    reset();
    setProductId(null);
    setKey((state) => state + 1);
  };

  useEffect(() => {
    readDocuments();
  }, [render]);

  return (
    <Box paddingTop="8rem">
      <Card sx={{ padding: "1rem" }}>
        <Typography component="h1" fontWeight="500">
          Products
          <Typography
            component="span"
            color="textSecondary"
            sx={{ marginLeft: "0.25rem" }}
          >
            {productId && "*update (clear to cancel)"}
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
              key={`sku-${key}`}
              label="Sku"
              size="small"
              {...register("sku", { required: true })}
              helperText={errors.sku && "Field is required"}
              error={Boolean(errors.sku)}
              disabled={loading}
            />
            <TextField
              key={`details-${key}`}
              label="Details"
              size="small"
              {...register("details", { required: true })}
              helperText={errors.details && "Field is required"}
              error={Boolean(errors.details)}
              disabled={loading}
            />
          </Box>
          <Box className={styles.form_controls}>
            <Button type="submit" variant="contained">
              {productId ? "Update" : "Create"}
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
                <TableCell>Sku</TableCell>
                <TableCell>Details</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">@</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.details}</TableCell>
                    <TableCell>
                      {product.submittedDate.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" justifyContent="center">
                        <Tooltip title="Update">
                          <IconButton
                            aria-label="update"
                            onClick={() => updateFormFields(product)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            aria-label="delete"
                            onClick={() => deleteDocument(product.id)}
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
            count={products.length}
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
