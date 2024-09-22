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
import { useContext, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { firebaseService } from "src/services/firebase";
import { SnackbarContext } from "src/contexts/snackbar";
import { useEmailPattern } from "src/composables/patterns";

export default function Users() {
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

  const [userId, setUserId] = useState(null);

  const [users, setUsers] = useState([]);

  const [role, setRole] = useState("");

  const [status, setStatus] = useState("");

  const [page, setPage] = useState(0);

  const rowsPerPage = 10;

  const usersList = useMemo(
    () => [...users].filter((user) => user.email !== "admin@admin.com"),
    [users]
  );

  const updateFormFields = (data) => {
    Object.entries(data).map(([prop, value]) => setValue(prop, value));
    setUserId(data.id);
    setRole(data.role);
    setStatus(data.status);
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

  const handleChangeRole = (event) => {
    setRole(event.target.value);
  };

  const handleChangeStatus = (event) => {
    setStatus(event.target.value);
  };

  const createDocument = async (data) => {
    setLoading(true);
    const response = await firebaseService.createUserByAdmin(
      data.name,
      data.email,
      data.password,
      data.role,
      data.status
    );
    setSeverity(response.code === 200 ? "success" : "error");
    setSnack(response.message);
    setLoading(false);
    setRender((state) => state + 1);
    resetForm();
  };

  const readDocuments = async () => {
    const response = await firebaseService.findAllDocs("users");
    if (response.code === 200) setUsers(response.data);
  };

  const updateDocument = async (data) => {
    setLoading(true);
    const documentData = formatData(data);
    const response = await firebaseService.updateDocById(
      "users",
      userId,
      documentData
    );
    setSeverity(response.code === 200 ? "success" : "error");
    setSnack(response.message);
    setLoading(false);
    setRender((state) => state + 1);
    resetForm();
  };

  const deleteDocument = async (documentId, email, password) => {
    setLoading(true);
    const response = await firebaseService.deleteUserByAdmin(
      documentId,
      email,
      password
    );
    setSeverity(response.code === 200 ? "success" : "error");
    setSnack(response.message);
    setLoading(false);
    setRender((state) => state + 1);
    resetForm();
  };

  const onSubmit = async (data) => {
    const request = userId ? updateDocument : createDocument;
    await request(data);
  };

  const resetForm = () => {
    reset();
    setUserId(null);
    setRole("");
    setStatus("");
    setKey((state) => state + 1);
  };

  useEffect(() => {
    readDocuments();
  }, [render]);

  return (
    <Box paddingTop="8rem">
      <Card sx={{ padding: "1rem" }}>
        <Typography component="h1" fontWeight="500">
          Users
          <Typography
            component="span"
            color="textSecondary"
            sx={{ marginLeft: "0.25rem" }}
          >
            {userId && "*update (clear to cancel)"}
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
              helperText={errors.email && "Field should be a valid e-mail"}
              error={Boolean(errors.email)}
              disabled={!!userId || loading}
            />
            <TextField
              key={`password-${key}`}
              label="Password"
              size="small"
              type="password"
              {...register("password", { required: true, minLength: 6 })}
              helperText={errors.password && "Field should be a valid password"}
              error={Boolean(errors.password)}
              disabled={!!userId || loading}
            />
            <FormControl
              size="small"
              error={Boolean(errors.role)}
              disabled={loading}
            >
              <InputLabel id="roles">Roles</InputLabel>
              <Select
                labelId="roles"
                label="Roles"
                size="small"
                {...register("role", { required: true })}
                value={role}
                onChange={handleChangeRole}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value="collaborator">
                  <span>Collaborator</span>
                </MenuItem>
                <MenuItem value="admin">
                  <span>Admin</span>
                </MenuItem>
              </Select>
              <FormHelperText>
                {errors.role && "Field is required"}
              </FormHelperText>
            </FormControl>
            <FormControl
              size="small"
              error={Boolean(errors.status)}
              disabled={loading}
            >
              <InputLabel id="status">Status</InputLabel>
              <Select
                labelId="status"
                label="Status"
                size="small"
                {...register("status", { required: true })}
                value={status}
                onChange={handleChangeStatus}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value="active">
                  <span>Active</span>
                </MenuItem>
                <MenuItem value="inactive">
                  <span>Inactive</span>
                </MenuItem>
              </Select>
              <FormHelperText>
                {errors.status && "Field is required"}
              </FormHelperText>
            </FormControl>
          </Box>
          <Box className={styles.form_controls}>
            <Button type="submit" variant="contained">
              {userId ? "Update" : "Create"}
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
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">@</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usersList
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.status}</TableCell>
                    <TableCell>
                      {user.submittedDate.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" justifyContent="center">
                        <Tooltip title="Update">
                          <IconButton onClick={() => updateFormFields(user)}>
                            <Update />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Update">
                          <IconButton
                            onClick={() =>
                              deleteDocument(user.id, user.email, user.password)
                            }
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
            count={users.length}
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
