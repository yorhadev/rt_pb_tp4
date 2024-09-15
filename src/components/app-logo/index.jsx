import { Box, Typography } from "@mui/material";

export default function AppLogo(props) {
  return (
    <Box {...props} sx={{ cursor: "pointer" }}>
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
