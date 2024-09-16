import styles from "./styles.module.css";
import { Box, Button, Divider, TextField, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEmailPattern } from "src/composables/patterns";
import { firebaseService } from "src/services/firebase";
import { useContext, useState } from "react";
import { AuthContext } from "src/contexts/auth";
import { SnackbarContext } from "src/contexts/snackbar";

export default function Login() {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [, setUser] = useContext(AuthContext);
  const [, setSnack, setSeverity] = useContext(SnackbarContext);
  const navigate = useNavigate();
  const onSubmit = async (data) => {
    setLoading(true);
    const response = await firebaseService.signIn(data.email, data.password);
    if (response.code === 200) {
      setUser(response.data);
      setSeverity("success");
      navigate("/dashboard");
    } else {
      setSeverity("error");
    }
    setSnack(response.message);
    setLoading(false);
  };

  return (
    <Box component="main" className={styles.login_container}>
      <Box className={styles.login_content_container}>
        <Box textAlign="center">
          <Typography component="h1" variant="h4">
            Login
          </Typography>
          <Typography component="p" variant="subtitle1" color="textSecondary">
            Welcome back! Please enter your details.
          </Typography>
        </Box>
        <Box
          component="form"
          className={styles.login_form_container}
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
        >
          <TextField
            label="Email"
            size="small"
            {...register("email", { required: true, pattern: useEmailPattern })}
            helperText={errors.email && "Field should be a valid e-mail"}
            error={Boolean(errors.email)}
            disabled={loading}
          />
          <TextField
            label="Password"
            size="small"
            type="password"
            {...register("password", { required: true, minLength: 6 })}
            helperText={errors.password && "Field should be a valid password"}
            error={Boolean(errors.password)}
            disabled={loading}
          />
          <Button variant="contained" type="submit" disabled={loading}>
            Continue with Email
          </Button>
        </Box>
        <Box className={styles.login_nav_container}>
          <Typography>Don't have an account?</Typography>
          <Link to={loading ? "#" : "/register"}>Sign up</Link>
        </Box>
        <Divider>
          <Typography component="p" variant="overline" color="textSecondary">
            OR
          </Typography>
        </Divider>
        <Box textAlign="center">
          <Link to={loading ? "#" : "/"}>Return to Home</Link>
        </Box>
      </Box>
    </Box>
  );
}
