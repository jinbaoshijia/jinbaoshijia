class FeeCalculator {
    constructor() {
        this.currentMode = 'sign'; // 'sign' 或 'terminate'
        this.initEventListeners();
    }

    initEventListeners() {
        // 模式切换
        document.getElementById('signMode').addEventListener('click', () => this.switchMode('sign'));
        document.getElementById('terminateMode').addEventListener('click', () => this.switchMode('terminate'));

        // 按钮事件
        document.getElementById('calculateBtn').addEventListener('click', () => this.calculateFees());
        document.getElementById('generateBtn').addEventListener('click', () => this.generateNotification());
        document.getElementById('copyBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.copyToClipboard();
        });

        // 实时计算（可选）
        this.setupRealTimeCalculation();
    }

    switchMode(mode) {
        this.currentMode = mode;
        const signBtn = document.getElementById('signMode');
        const terminateBtn = document.getElementById('terminateMode');

        if (mode === 'sign') {
            signBtn.classList.add('active');
            terminateBtn.classList.remove('active');
        } else {
            signBtn.classList.remove('active');
            terminateBtn.classList.add('active');
        }
    }

    validateInputs() {
        const inputs = document.querySelectorAll('input[type="number"]');
        let isValid = true;

        inputs.forEach(input => {
            input.classList.remove('error');
            if (input.value && parseFloat(input.value) < 0) {
                input.classList.add('error');
                isValid = false;
            }
        });

        // 验证读数顺序
        const validateReadings = (prevId, currId) => {
            const prev = parseFloat(document.getElementById(prevId).value);
            const curr = parseFloat(document.getElementById(currId).value);
            
            if (prev && curr && prev > curr) {
                document.getElementById(prevId).classList.add('error');
                document.getElementById(currId).classList.add('error');
                isValid = false;
            }
        };

        validateReadings('waterPrevReading', 'waterCurrReading');
        validateReadings('electricPrevReading', 'electricCurrReading');
        validateReadings('gasPrevReading', 'gasCurrReading');

        return isValid;
    }

    calculateFees() {
        if (!this.validateInputs()) {
            alert('请检查输入数据，确保所有数值有效且读数顺序正确！');
            return;
        }

        const baseDays = parseInt(document.getElementById('baseDays').value);
        const propertyResult = this.calculatePropertyFee(baseDays);
        const waterResult = this.calculateWaterFee();
        const electricResult = this.calculateElectricFee();
        const gasResult = this.calculateGasFee();

        // 根据模式计算总费用
        let ownerTotalFee = 0;
        let tenantTotalFee = 0;
        let tenantPropertyFee = 0;

        if (this.currentMode === 'sign') {
            // 出房签约模式
            ownerTotalFee = propertyResult.totalFee - propertyResult.tenantDailyFee + 
                           waterResult.totalFee + electricResult.totalFee + gasResult.totalFee;
            tenantTotalFee = propertyResult.tenantDailyFee + waterResult.totalFee + 
                           electricResult.totalFee + gasResult.totalFee;
            tenantPropertyFee = propertyResult.tenantDailyFee;
        } else {
            // 出房解约模式
            tenantPropertyFee = propertyResult.totalFee - propertyResult.fullMonthFee + propertyResult.tenantDailyFee;
            tenantTotalFee = tenantPropertyFee + waterResult.totalFee + electricResult.totalFee + gasResult.totalFee;
            ownerTotalFee = 0; // 解约模式下业主应收为0
        }

        const results = {
            property: propertyResult,
            water: waterResult,
            electric: electricResult,
            gas: gasResult,
            baseDays: baseDays,
            ownerTotalFee: ownerTotalFee,
            tenantTotalFee: tenantTotalFee,
            tenantPropertyFee: tenantPropertyFee
        };

        this.displayResults(results);
        
        // 自动生成通知
        this.generateNotification(results);
        
        return results;
    }

    calculatePropertyFee(baseDays) {
        const rate = parseFloat(document.getElementById('propertyFeeRate').value) || 0;
        const monthsRange = document.getElementById('propertyMonths').value;
        const scatteredDays = parseInt(document.getElementById('scatteredDays').value) || 0;
        
        let fullMonths = 0;

        if (monthsRange) {
            // 解析月份范围，例如 "5到8月"
            const match = monthsRange.match(/(\d+)[^\d]*(\d+)/);
            if (match) {
                const start = parseInt(match[1]);
                const end = parseInt(match[2]);
                fullMonths = Math.max(0, end - start + 1);
            }
        }

        // 计算租客按天基数费用（按天计算）
        const tenantDailyFee = rate > 0 ? (rate / baseDays) * scatteredDays : 0;
        
        // 整月费用（业主承担部分）
        const fullMonthFee = rate > 0 ? rate * fullMonths : 0;
        
        // 总物业费（整月费用 + 按天费用）
        const totalPropertyFee = fullMonthFee + tenantDailyFee;

        return {
            rate,
            fullMonths,
            scatteredDays,
            tenantDailyFee,      // 租客按天基数费用
            fullMonthFee,        // 整月费用（业主承担）
            totalFee: totalPropertyFee  // 总物业费
        };
    }

    calculateWaterFee() {
        const prev = parseFloat(document.getElementById('waterPrevReading').value) || 0;
        const curr = parseFloat(document.getElementById('waterCurrReading').value) || 0;
        const rate = parseFloat(document.getElementById('waterRate').value) || 0;
        const existingFee = parseFloat(document.getElementById('waterExistingFee').value) || 0;

        const usage = Math.max(0, curr - prev);
        const currentFee = usage * rate;
        const totalFee = existingFee + currentFee;

        return {
            account: document.getElementById('waterAccount').value,
            prevReading: prev,
            currReading: curr,
            usage,
            rate,
            existingFee,
            currentFee,
            totalFee
        };
    }

    calculateElectricFee() {
        const prev = parseFloat(document.getElementById('electricPrevReading').value) || 0;
        const curr = parseFloat(document.getElementById('electricCurrReading').value) || 0;
        const rate = parseFloat(document.getElementById('electricRate').value) || 0;
        const existingFee = parseFloat(document.getElementById('electricExistingFee').value) || 0;

        const usage = Math.max(0, curr - prev);
        const currentFee = usage * rate;
        const totalFee = existingFee + currentFee;

        return {
            account: document.getElementById('electricAccount').value,
            prevReading: prev,
            currReading: curr,
            usage,
            rate,
            existingFee,
            currentFee,
            totalFee
        };
    }

    calculateGasFee() {
        const prev = parseFloat(document.getElementById('gasPrevReading').value) || 0;
        const curr = parseFloat(document.getElementById('gasCurrReading').value) || 0;
        const rate = parseFloat(document.getElementById('gasRate').value) || 0;
        const balance = parseFloat(document.getElementById('gasBalance').value) || 0;

        const usage = Math.max(0, curr - prev);
        const currentFee = usage * rate;
        const totalFee = balance - currentFee; // 余额减去本次费用

        return {
            account: document.getElementById('gasAccount').value,
            prevReading: prev,
            currReading: curr,
            usage,
            rate,
            balance,
            currentFee,
            totalFee
        };
    }

    displayResults(results) {
        const resultsDiv = document.getElementById('calculationResults');
        
        let html = `
            <h4>计算结果汇总</h4>
            <p><strong>物业费总计：</strong>¥${results.property.totalFee.toFixed(2)}</p>
            <p><strong>水费总计：</strong>¥${results.water.totalFee.toFixed(2)}</p>
            <p><strong>电费总计：</strong>¥${results.electric.totalFee.toFixed(2)}</p>
            <p><strong>燃气费总计：</strong>¥${results.gas.totalFee.toFixed(2)}</p>
            <p><strong>基数天数：</strong>${results.baseDays}天</p>
        `;

        if (this.currentMode === 'sign') {
            html += `
                <p><strong>业主总欠费：</strong>¥${results.ownerTotalFee.toFixed(2)}</p>
                <p><strong>租客总欠费：</strong>¥${results.tenantTotalFee.toFixed(2)}</p>
                <p><strong>租客物业费：</strong>¥${results.tenantPropertyFee.toFixed(2)}</p>
            `;
        } else {
            html += `
                <p><strong>租客物业费欠：</strong>¥${results.tenantPropertyFee.toFixed(2)}</p>
                <p><strong>租客总欠费：</strong>¥${results.tenantTotalFee.toFixed(2)}</p>
            `;
        }

        resultsDiv.innerHTML = html;
    }

    generateNotification(results = null) {
        const finalResults = results || this.calculateFees();
        if (!finalResults) return;

        const address = document.getElementById('propertyAddress').value || '未填写地址';
        
        let notificationText = '';

        if (this.currentMode === 'sign') {
            notificationText = this.generateSignTemplate(address, finalResults);
        } else {
            notificationText = this.generateTerminateTemplate(address, finalResults);
        }

        document.getElementById('notificationText').value = notificationText;
    }

    generateSignTemplate(address, results) {
        return `${address}   （出房签约）\t\t\t\t\t
我把各项费用给您汇报一下\t\t\t\t\t
物业费每月${results.property.rate}   ${document.getElementById('propertyMonths').value || '未填写'}未结\t\t\t\t\t
共计欠费${results.property.totalFee.toFixed(2)}\t\t\t\t\t
\t\t\t\t\t
水费缴费帐户  ${results.water.account || ''}\t\t\t\t\t
现表  ${results.water.currReading}\t\t\t\t\t
抄表  ${results.water.prevReading}\t\t\t\t\t
有欠费  ${results.water.existingFee}\t\t\t\t\t
差额  ${results.water.usage}*${results.water.rate}=${results.water.currentFee.toFixed(2)}\t\t\t\t\t
共计欠费  ${results.water.totalFee.toFixed(2)}\t\t\t\t\t
\t\t\t\t\t
电费缴费帐户  ${results.electric.account || ''}\t\t\t\t\t
现表  ${results.electric.currReading}\t\t\t\t\t
抄表  ${results.electric.prevReading}\t\t\t\t\t
有欠费  ${results.electric.existingFee}\t\t\t\t\t
差额  ${results.electric.usage}*${results.electric.rate}=${results.electric.currentFee.toFixed(2)}\t\t\t\t\t
共计欠费  ${results.electric.totalFee.toFixed(2)}\t\t\t\t\t
\t\t\t\t\t
燃气缴费帐户  ${results.gas.account || ''}\t\t\t\t\t
现表  ${results.gas.currReading}\t\t\t\t\t
抄表  ${results.gas.prevReading}\t\t\t\t\t
有余额  ${results.gas.balance}\t\t\t\t\t
\t\t\t\t\t
综上\t\t\t\t\t
物业费${results.property.totalFee.toFixed(2)}     租客物业费欠${results.tenantPropertyFee.toFixed(2)}\t\t\t\t\t
水费欠${results.water.totalFee.toFixed(2)}\t\t\t\t\t
电费欠${results.electric.totalFee.toFixed(2)}\t\t\t\t\t
燃气费欠${results.gas.totalFee.toFixed(2)}\t\t\t\t\t
\t\t\t\t\t
综上共计欠费：业主欠${results.ownerTotalFee.toFixed(2)}元   租客物业费${results.tenantPropertyFee.toFixed(2)}元（本月${results.property.scatteredDays}天，燃气余额${results.gas.balance}，共计${results.tenantTotalFee.toFixed(2)}元）`;
    }

    generateTerminateTemplate(address, results) {
        return `${address}   （出房解约）\t\t\t\t\t
我把各项费用给您汇报一下\t\t\t\t\t
物业费每月${results.property.rate}   ${document.getElementById('propertyMonths').value || ''}未结\t\t\t\t\t
共计欠费${results.property.totalFee.toFixed(2)}    租客应承担：${results.tenantPropertyFee.toFixed(2)}元（${results.property.scatteredDays}天）\t\t\t\t\t
\t\t\t\t\t
水费缴费帐户  ${results.water.account || ''}\t\t\t\t\t
现表  ${results.water.currReading}\t\t\t\t\t
抄表  ${results.water.prevReading}\t\t\t\t\t
有欠费  ${results.water.existingFee}\t\t\t\t\t
差额  ${results.water.usage}*${results.water.rate}=${results.water.currentFee.toFixed(2)}\t\t\t\t\t
共计欠费  ${results.water.totalFee.toFixed(2)}\t\t\t\t\t
\t\t\t\t\t
电费缴费帐户  ${results.electric.account || ''}\t\t\t\t\t
现表  ${results.electric.currReading}\t\t\t\t\t
抄表  ${results.electric.prevReading}\t\t\t\t\t
有欠费  ${results.electric.existingFee}\t\t\t\t\t
差额  ${results.electric.usage}*${results.electric.rate}=${results.electric.currentFee.toFixed(2)}\t\t\t\t\t
共计欠费  ${results.electric.totalFee.toFixed(2)}\t\t\t\t\t
\t\t\t\t\t
燃气缴费帐户  ${results.gas.account || ''}\t\t\t\t\t
现表  ${results.gas.currReading}\t\t\t\t\t
抄表  ${results.gas.prevReading}\t\t\t\t\t
有余额  ${results.gas.balance}\t\t\t\t\t
\t\t\t\t\t
综上\t\t\t\t\t
物业费${results.property.totalFee.toFixed(2)}    租客物业费欠${results.tenantPropertyFee.toFixed(2)}\t\t\t\t\t
水费欠${results.water.totalFee.toFixed(2)}\t\t\t\t\t
电费欠${results.electric.totalFee.toFixed(2)}\t\t\t\t\t
燃气费欠${results.gas.totalFee.toFixed(2)}\t\t\t\t\t
\t\t\t\t\t
综上共计欠费：租客欠${results.tenantTotalFee.toFixed(2)}元\t\t\t\t\t`;
    }

    async copyToClipboard() {
        const text = document.getElementById('notificationText').value;
        if (!text) {
            alert('请先生成通知内容！');
            return;
        }

        // Android优化方案
        try {
            if (/Android/.test(navigator.userAgent)) {
                const blob = new Blob([text], {type: 'text/plain'});
                await navigator.clipboard.write([
                    new ClipboardItem({'text/plain': blob})
                ]);
            } else {
                await navigator.clipboard.writeText(text);
            }
            alert('内容已复制到剪贴板');
        } catch (err) {
            console.error('高级复制失败:', err);
            
            // 兼容性方案
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                if (document.execCommand('copy')) {
                    alert('内容已复制');
                } else {
                    throw new Error('execCommand失败');
                }
            } catch (e) {
                alert('自动复制失败，请长按文本选择复制');
            } finally {
                document.body.removeChild(textarea);
            }
        }
        if (!text) {
            alert('请先生成通知内容！');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            alert('内容已成功复制到剪贴板！');
        } catch (err) {
            console.error('复制失败:', err);
            alert('复制失败，请手动复制文本内容。');
        }
    }

    setupRealTimeCalculation() {
        // 可选：添加实时计算功能
        const inputs = document.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                // 可以在这里添加实时计算逻辑
            });
        });
    }
}

// PWA安装提示功能
function showInstallPrompt() {
    let deferredPrompt;
    const installButton = document.createElement('button');
    installButton.textContent = '📱 添加到主屏幕';
    installButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        background: linear-gradient(135deg, #4a90e2 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 25px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-size: 16px;
        font-weight: 500;
        z-index: 1000;
        display: none;
        animation: pulse 2s infinite;
    `;
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(installButton);

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // 显示按钮并添加动画
        installButton.style.display = 'block';
        
        // 30秒后自动隐藏
        setTimeout(() => {
            installButton.style.display = 'none';
        }, 30000);
        
        installButton.addEventListener('click', async () => {
            try {
                installButton.style.display = 'none';
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                
                if (outcome === 'accepted') {
                    console.log('用户接受了安装提示');
                    // 可以在这里添加分析事件
                } else {
                    console.log('用户拒绝了安装提示');
                }
            } catch (err) {
                console.error('安装提示失败:', err);
                // 提供备用安装说明
                alert('请点击浏览器菜单，选择"添加到主屏幕"手动安装');
            }
            deferredPrompt = null;
        });
    });

    window.addEventListener('appinstalled', () => {
        console.log('PWA已安装');
        installButton.style.display = 'none';
        deferredPrompt = null;
        // 可以在这里添加安装完成事件
    });
    
    // iOS特殊处理（iOS不支持beforeinstallprompt事件）
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        const isStandalone = window.navigator.standalone;
        if (!isStandalone) {
            installButton.style.display = 'block';
            installButton.textContent = '📱 点击分享，选择"添加到主屏幕"';
            installButton.onclick = () => {
                alert('请点击浏览器分享按钮，然后选择"添加到主屏幕"');
            };
        }
    }
}

// 初始化计算器和PWA功能
document.addEventListener('DOMContentLoaded', () => {
    new FeeCalculator();
    
    // 检查是否已安装PWA
    const isPWAInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                          (navigator.standalone === true);
    
    if (!isPWAInstalled) {
        showInstallPrompt();
        
        // 移动设备特定优化
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            console.log('在移动设备上运行');
            
            // 添加PWA安装引导提示
            setTimeout(() => {
                const pwaTip = document.createElement('div');
                pwaTip.innerHTML = `
                    <div style="position: fixed; bottom: 80px; left: 20px; right: 20px;
                                background: white; padding: 15px; border-radius: 10px;
                                box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 999;
                                text-align: center;">
                        <p style="margin: 0 0 10px; font-size: 14px;">
                            点击右上角 <span style="color: #4a90e2;">⋮</span> 或 <span style="color: #4a90e2;">分享</span> 按钮，
                            选择"添加到主屏幕"安装应用
                        </p>
                        <button style="background: #4a90e2; color: white; border: none;
                                    padding: 8px 16px; border-radius: 20px; font-size: 14px;
                                    cursor: pointer;" onclick="this.parentNode.style.display='none'">
                            知道了
                        </button>
                    </div>
                `;
                document.body.appendChild(pwaTip);
                
                // 10秒后自动消失
                setTimeout(() => {
                    pwaTip.style.display = 'none';
                }, 10000);
            }, 5000);
        }
    }
});
