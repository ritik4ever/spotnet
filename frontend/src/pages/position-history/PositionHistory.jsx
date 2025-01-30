import EthIcon from '@/assets/icons/ethereum.svg?react';
import filterIcon from '@/assets/icons/filter-horizontal.svg';
import HealthIcon from '@/assets/icons/health.svg?react';
import StrkIcon from '@/assets/icons/strk.svg?react';
import UsdIcon from '@/assets/icons/usd_coin.svg?react';
import Card from '@/components/ui/card/Card';
import Spinner from '@/components/ui/spinner/Spinner';
import useDashboardData from '@/hooks/useDashboardData';
import { usePositionHistoryTable } from '@/hooks/usePositionHistory';
import PositionHistoryModal from '@/pages/position-history/PositionHistoryModal';
import PositionPagination from '@/pages/position-history/PositionPagination';
import { useEffect, useState } from 'react';
import './positionHistory.css';
import DashboardLayout from '../DashboardLayout';

function PositionHistory() {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: tableData, isPending } = usePositionHistoryTable();
  const { data: dashboardData, isLoading: isDashboardLoading } = useDashboardData();

  const [filteredTableData, setFilteredTableData] = useState(tableData);
  const positionsOnPage = 10;

  const getFilteredData = (data, page, itemsPerPage) => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.slice(start, end);
  };

  useEffect(() => {
    if (!isPending && tableData) setFilteredTableData(getFilteredData(tableData, currentPage, positionsOnPage));
  }, [currentPage, isPending, tableData]);

  const tokenIconMap = {
    STRK: <StrkIcon className="token-icon" />,
    USDC: <UsdIcon className="token-icon" />,
    ETH: <EthIcon className="token-icon" />,
  };

  const statusStyles = {
    opened: 'status-opened',
    closed: 'status-closed',
    pending: 'status-pending',
  };

  return (
    <DashboardLayout title="Position History">
      <div className="position-content">
        <div className="position-top-cards">
          <Card label="Health Factor" value={dashboardData?.health_ratio || '0.00'} icon={<HealthIcon className="icon" />} />
          <Card label="Borrow Balance" value={dashboardData?.borrowed || '0.00'} icon={<EthIcon className="icon" />} />
        </div>
      </div>

      <div className="position-content-table">
        <div className="position-table-title">
          <p>Position History</p>
        </div>

        <div className="position-table">
          {isPending || isDashboardLoading ? (
            <div className="spinner-container">
              <Spinner loading={isPending || isDashboardLoading} />
            </div>
          ) : (
            <table className="text-white">
              <thead>
                <tr>
                  <th></th>
                  <th>Token</th>
                  <th>Amount</th>
                  <th>Created At</th>
                  <th>Status</th>
                  <th>Start Price</th>
                  <th>Multiplier</th>
                  <th>Liquidated</th>
                  <th>Closed At</th>
                  <th className="action-column">
                    <img src={filterIcon || "/placeholder.svg"} alt="filter-icon" draggable="false" />
                  </th>
                </tr>
              </thead>

              <tbody>
                {!tableData || tableData.length === 0 || !filteredTableData ? (
                  <tr>
                    <td colSpan="10">No opened positions</td>
                  </tr>
                ) : (
                  filteredTableData.map((data, index) => (
                    <tr key={data.id}>
                      <td className="index">{index + 1}.</td>
                      <td>
                        <div className="token-cell">
                          {tokenIconMap[data.token_symbol]}
                          <span className="token-symbol">{data.token_symbol.toUpperCase()}</span>
                        </div>
                      </td>
                      <td>{data.amount}</td>
                      <td>{data.created_at}</td>
                      <td className={`status-cell ${statusStyles[data.status.toLowerCase()] || ''}`}>{data.status}</td>
                      <td>{data.start_price}</td>
                      <td>{data.multiplier}</td>
                      <td>{data.is_liquidated}</td>
                      <td>{data.closed_at}</td>
                      <td className="action-column">
                        <span className="action-button" onClick={() => setSelectedPosition({ data, index })}>
                          &#x22EE;
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <PositionPagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isPending={isPending || isDashboardLoading}
        tableData={tableData}
        positionsOnPage={positionsOnPage}
      />

      {selectedPosition && (
        <PositionHistoryModal
          position={selectedPosition.data}
          onClose={() => setSelectedPosition(null)}
          tokenIcon={tokenIconMap}
          statusStyles={statusStyles}
          index={selectedPosition.index + 1}
        />
      )}
    </DashboardLayout>
  );
}

export default PositionHistory;