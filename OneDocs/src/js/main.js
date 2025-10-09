// 首页JavaScript功能

document.addEventListener('DOMContentLoaded', function() {
    // 添加页面加载动画
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in';
        document.body.style.opacity = '1';
    }, 100);

    // 为特性卡片添加延迟动画
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.animationDelay = `${0.3 + index * 0.1}s`;
    });

    // 添加鼠标悬停效果
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// 跳转到工具页面
function goToTool() {
    // 添加页面切换动画
    document.body.style.transition = 'opacity 0.3s ease-out';
    document.body.style.opacity = '0';
    
    setTimeout(() => {
        window.location.href = 'tool.html';
    }, 300);
}

// 添加滚动视差效果
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const heroSection = document.querySelector('.hero-section');
    
    if (heroSection) {
        heroSection.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
});