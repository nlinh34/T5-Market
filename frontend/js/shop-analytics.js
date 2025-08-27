import { ShopAPI } from '../APIs/shopAPI.js';
import { formatCurrency } from '../APIs/utils/formatter.js';

let dailyChart = null;
let currentData = null;

async function init() {
    setupControls();
    await loadAndRender();
}

function setHeaderShopInfo(shop) {
    const nameEl = document.getElementById('headerShopName');
    const avatarEl = document.getElementById('headerShopAvatar');
    if (nameEl) nameEl.textContent = shop.name || 'Tên cửa hàng';
    if (avatarEl) {
        if (shop.logoUrl) {
            avatarEl.innerHTML = `<img loading="lazy" src="${shop.logoUrl}" alt="${shop.name || 'Shop'}">`;
        } else {
            const initials = (shop.name || 'NA').trim().slice(0,2).toUpperCase();
            avatarEl.textContent = initials;
        }
    }
}

function setupControls() {
    const periodSelect = document.getElementById('periodSelect');
    const customRange = document.getElementById('customRange');
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const applyBtn = document.getElementById('applyRangeBtn');
    
    // Mobile-optimized touch interactions
    if ('ontouchstart' in window) {
        // Add touch feedback for mobile devices
        const touchElements = document.querySelectorAll('.btn, .select-custom, .date-input');
        touchElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            });
            element.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.style.transform = '';
                }, 100);
            });
        });
    }
    const exportBtn = document.getElementById('exportCsvBtn');

    periodSelect.addEventListener('change', () => {
        // Mobile-responsive display for custom range
        if (periodSelect.value === 'custom') {
            customRange.style.display = window.innerWidth <= 414 ? 'flex' : 'inline-flex';
        } else {
            customRange.style.display = 'none';
        }
        loadAndRender();
    });

    applyBtn.addEventListener('click', () => {
        loadAndRender();
    });

    exportBtn.addEventListener('click', () => exportCsv());
}

async function loadAndRender() {
    const periodSelect = document.getElementById('periodSelect');
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');

    // Get shop
    const myShopResp = await ShopAPI.getMyShop().catch(err => null);
    if (!myShopResp || !myShopResp.success || !myShopResp.data) {
        document.body.innerHTML = '<div style="padding:40px;">Không tìm thấy shop của bạn hoặc không có quyền xem. <a href="shop-manager.html">Quay lại</a></div>';
        return;
    }

    const shop = myShopResp.data;

    // Update header with shop info
    setHeaderShopInfo(shop);

    const params = {};
    if (periodSelect.value === 'custom' && startDate.value && endDate.value) {
        params.startDate = startDate.value;
        params.endDate = endDate.value;
    } else {
        params.period = periodSelect.value;
    }

        const analyticsResp = await ShopAPI.getShopAnalytics(shop._id, params).catch(err => null);
        if (!analyticsResp || !analyticsResp.success) {
            document.body.innerHTML = '<div style="padding:40px;">Lỗi khi lấy báo cáo. Vui lòng thử lại sau.</div>';
            return;
        }

    processAndRender(analyticsResp.data);
}

function processAndRender(data) {
    currentData = data;
    const { daily, topProducts, revenueByProduct, totalOrders, totalRevenue } = data;

    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);

    renderDailyChart(daily);
    renderTopProducts(topProducts);
    renderRevenueByProduct(revenueByProduct);
}

function renderDailyChart(daily) {
    const canvas = document.getElementById('chartDailyCanvas');
    if (!canvas) return;

    const labels = daily.map(d => d.date);
    const data = daily.map(d => Math.round(d.revenue));

    const ctx = canvas.getContext('2d');

    if (dailyChart) {
        dailyChart.data.labels = labels;
        dailyChart.data.datasets[0].data = data;
        dailyChart.update();
        return;
    }

    dailyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Doanh thu',
                    data,
                    fill: true,
                    backgroundColor: 'rgba(0,177,255,0.12)',
                    borderColor: 'rgba(0,177,255,1)',
                    pointRadius: 3,
                    tension: 0.2,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { display: true, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 12 } },
                y: { display: true, ticks: { callback: v => formatCurrency(v) } }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => `Doanh thu: ${formatCurrency(ctx.parsed.y)}`
                    }
                },
                legend: { display: false }
            }
        }
    });
}

function renderTopProducts(products) {
    const tbody = document.querySelector('#topProducts tbody');
    tbody.innerHTML = '';
    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">Chưa có sản phẩm bán chạy</td></tr>';
        return;
    }

    products.forEach((p, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${i+1}</td><td>${p.name}</td><td>${p.qty}</td><td>${formatCurrency(p.revenue)}</td>`;
        tbody.appendChild(tr);
    });
}

function renderRevenueByProduct(list) {
    const tbody = document.querySelector('#revenueByProduct tbody');
    tbody.innerHTML = '';
    if (!list || list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3">Không có dữ liệu</td></tr>';
        return;
    }

    list.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${p.name}</td><td>${formatCurrency(p.revenue)}</td><td>${p.percentContribution}%</td>`;
        tbody.appendChild(tr);
    });
}

function exportCsv() {
    if (!currentData) return;
    const rows = [];
    rows.push(['Date','Orders','Revenue']);
    currentData.daily.forEach(d => rows.push([d.date, d.orders, d.revenue]));
    rows.push([]);
    rows.push(['Top Products']);
    rows.push(['Name','Qty','Revenue','%Contribution']);
    currentData.revenueByProduct.forEach(p => rows.push([p.name, p.qty, p.revenue, p.percentContribution]));

    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shop_analytics_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// Add mobile-specific optimizations
function initMobileOptimizations() {
    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            if (dailyChart) {
                dailyChart.resize();
            }
        }, 100);
    });

    // Handle window resize for responsive adjustments
    window.addEventListener('resize', () => {
        const customRange = document.getElementById('customRange');
        const periodSelect = document.getElementById('periodSelect');
        
        if (customRange && periodSelect && periodSelect.value === 'custom') {
            customRange.style.display = window.innerWidth <= 414 ? 'flex' : 'inline-flex';
        }
        
        if (dailyChart) {
            setTimeout(() => {
                dailyChart.resize();
            }, 100);
        }
    });

    // Improve table scrolling on mobile
    const tables = document.querySelectorAll('.table');
    tables.forEach(table => {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-container';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
    });
}

// Initialize mobile optimizations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initMobileOptimizations();
});

init();
