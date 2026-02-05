package edu.kh.goodsugar.common.mybatis;

import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;

import java.sql.*;
import java.time.*;

public class LocalTimeTimestampTypeHandler extends BaseTypeHandler<LocalTime> {

    // DB에는 날짜 의미 없고 "시간"만 쓰려는 거라,
    // 저장할 때는 임의 날짜(1970-01-01) 붙여서 TIMESTAMP로 저장
    private static final LocalDate DUMMY_DATE = LocalDate.of(1970, 1, 1);

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, LocalTime parameter, JdbcType jdbcType)
            throws SQLException {
        LocalDateTime dt = LocalDateTime.of(DUMMY_DATE, parameter);
        ps.setTimestamp(i, Timestamp.valueOf(dt));
    }

    @Override
    public LocalTime getNullableResult(ResultSet rs, String columnName) throws SQLException {
        Timestamp ts = rs.getTimestamp(columnName);
        return ts == null ? null : ts.toLocalDateTime().toLocalTime();
    }

    @Override
    public LocalTime getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        Timestamp ts = rs.getTimestamp(columnIndex);
        return ts == null ? null : ts.toLocalDateTime().toLocalTime();
    }

    @Override
    public LocalTime getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        Timestamp ts = cs.getTimestamp(columnIndex);
        return ts == null ? null : ts.toLocalDateTime().toLocalTime();
    }
}
