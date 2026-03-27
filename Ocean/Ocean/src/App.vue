<script>
	export default {
		onLaunch: function() {
			try {
				uni.removeStorageSync('ocean:auth')
				uni.removeStorageSync('ocean:mapState')
			} catch (e) {
			}
		},
		onShow: function() {
		},
		onHide: function() {
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
    @import '@/uni.scss';

	page,
	view,
	text,
	image,
	scroll-view,
	swiper,
	button,
	input,
	textarea {
		box-sizing: border-box;
	}

	page {
		background-color: $bg-color-light-blue;
		font-size: $font-size-base;
		line-height: $line-height-base;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        overflow: hidden;
	}
</style>
