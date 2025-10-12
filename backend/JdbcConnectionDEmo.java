import java.sql.*;

public class JdbcConnectionDEmo {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/whistle_db";
        String user = "springuser";
        String password = "springpass";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("✅ Connected to database: " + !conn.isClosed());
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
