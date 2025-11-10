# PowerShell 分支清理脚本
# 用法：.\cleanup_branches.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "   分支清理助手 v1.0" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 函数：显示当前分支状态
function Show-BranchStatus {
    Write-Host "📊 当前分支状态：" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "本地分支：" -ForegroundColor Green
    git branch
    Write-Host ""
    
    Write-Host "远程分支：" -ForegroundColor Green  
    git branch -r
    Write-Host ""
    
    Write-Host "未合并到 main 的分支：" -ForegroundColor Red
    git branch --no-merged main
    Write-Host ""
}

# 函数：检查分支差异
function Check-BranchDiff {
    param (
        [string]$branchName
    )
    
    Write-Host "🔍 检查分支: $branchName" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "未合并的提交：" -ForegroundColor Cyan
    git log main..$branchName --oneline --no-merges
    Write-Host ""
    
    Write-Host "文件变更统计：" -ForegroundColor Cyan
    git diff main...$branchName --stat
    Write-Host ""
}

# 函数：合并分支
function Merge-Branch {
    param (
        [string]$branchName
    )
    
    Write-Host "🔄 准备合并分支: $branchName" -ForegroundColor Yellow
    
    $confirm = Read-Host "确认要合并这个分支吗？(y/n)"
    
    if ($confirm -eq "y") {
        Write-Host "切换到 main 分支..." -ForegroundColor Green
        git checkout main
        
        Write-Host "拉取最新代码..." -ForegroundColor Green
        git pull origin main
        
        Write-Host "合并分支..." -ForegroundColor Green
        git merge $branchName
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ 合并成功！" -ForegroundColor Green
            
            $push = Read-Host "是否推送到远程？(y/n)"
            if ($push -eq "y") {
                git push origin main
                Write-Host "✅ 已推送到远程！" -ForegroundColor Green
            }
        } else {
            Write-Host "❌ 合并失败！请解决冲突后再继续。" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ 取消合并。" -ForegroundColor Yellow
    }
}

# 函数：删除本地分支
function Remove-LocalBranch {
    param (
        [string]$branchName,
        [bool]$force = $false
    )
    
    Write-Host "🗑️ 准备删除本地分支: $branchName" -ForegroundColor Yellow
    
    $confirm = Read-Host "确认要删除这个本地分支吗？(y/n)"
    
    if ($confirm -eq "y") {
        if ($force) {
            git branch -D $branchName
        } else {
            git branch -d $branchName
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ 本地分支已删除！" -ForegroundColor Green
        } else {
            Write-Host "❌ 删除失败！分支可能未合并，使用 -force 参数强制删除。" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ 取消删除。" -ForegroundColor Yellow
    }
}

# 函数：删除远程分支
function Remove-RemoteBranch {
    param (
        [string]$branchName
    )
    
    Write-Host "🗑️ 准备删除远程分支: $branchName" -ForegroundColor Yellow
    Write-Host "⚠️  警告：这将影响所有协作者！" -ForegroundColor Red
    
    $confirm = Read-Host "确认要删除这个远程分支吗？(y/n)"
    
    if ($confirm -eq "y") {
        git push origin --delete $branchName
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ 远程分支已删除！" -ForegroundColor Green
        } else {
            Write-Host "❌ 删除失败！" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ 取消删除。" -ForegroundColor Yellow
    }
}

# 主菜单
function Show-Menu {
    Write-Host ""
    Write-Host "请选择操作：" -ForegroundColor Cyan
    Write-Host "1. 查看分支状态" -ForegroundColor White
    Write-Host "2. 检查 codex/develop-acee-projectx-backend-api 分支差异" -ForegroundColor White
    Write-Host "3. 合并 codex/develop-acee-projectx-backend-api 到 main" -ForegroundColor White
    Write-Host "4. 检查 feat/mock-api-integration 分支差异" -ForegroundColor White
    Write-Host "5. 检查 feat/multi-wallet-integration 分支差异" -ForegroundColor White
    Write-Host "6. 删除本地分支" -ForegroundColor White
    Write-Host "7. 删除远程分支" -ForegroundColor White
    Write-Host "8. 清理所有远程追踪分支" -ForegroundColor White
    Write-Host "9. 退出" -ForegroundColor White
    Write-Host ""
}

# 主循环
$continue = $true
while ($continue) {
    Show-Menu
    $choice = Read-Host "请输入选项 (1-9)"
    
    switch ($choice) {
        "1" {
            Show-BranchStatus
        }
        "2" {
            Check-BranchDiff "codex/develop-acee-projectx-backend-api"
        }
        "3" {
            Merge-Branch "codex/develop-acee-projectx-backend-api"
        }
        "4" {
            Check-BranchDiff "feat/mock-api-integration"
        }
        "5" {
            Check-BranchDiff "feat/multi-wallet-integration"
        }
        "6" {
            $branch = Read-Host "请输入要删除的本地分支名"
            $forceInput = Read-Host "是否强制删除？(y/n)"
            $force = $forceInput -eq "y"
            Remove-LocalBranch $branch $force
        }
        "7" {
            $branch = Read-Host "请输入要删除的远程分支名（不含 origin/）"
            Remove-RemoteBranch $branch
        }
        "8" {
            Write-Host "🧹 清理远程追踪分支..." -ForegroundColor Yellow
            git fetch --all --prune
            Write-Host "✅ 清理完成！" -ForegroundColor Green
        }
        "9" {
            Write-Host "👋 再见！" -ForegroundColor Cyan
            $continue = $false
        }
        default {
            Write-Host "❌ 无效的选项，请重新选择。" -ForegroundColor Red
        }
    }
    
    if ($continue) {
        Write-Host ""
        Read-Host "按 Enter 继续..."
        Clear-Host
        Write-Host "==================================" -ForegroundColor Cyan
        Write-Host "   分支清理助手 v1.0" -ForegroundColor Cyan
        Write-Host "==================================" -ForegroundColor Cyan
    }
}

