import { Box, Typography } from "@mui/material";

export default function AppLogo() {
  return (
    <Box>
      <Typography component="p" variant="h6">
        <Typography component="span" color="primary">
          GENERICO
        </Typography>
        <Typography component="span" color="primary" fontWeight="300">
          SYSTEM
        </Typography>
      </Typography>
    </Box>
  );
}
