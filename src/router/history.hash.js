/**
 * @fileOverview 浏览器历史管理
 */

/**
 * Hash
 * > 用户不需要手动调用，当使用`history.start`时，会根据传递的参数自动实例化此类并覆盖之前的`history`实例。
 *
 * > 当用户调用destroy时，history将自动恢复至初始状态。
 * @class Hash
 * @namespace __Chassis__.History
 * @constructor
 * @param {object} handler
 * @private
 */
History.Hash = History.extend({
    
    /**
     * 当所有的路由创建并设置完毕，调用 `__Chassis__.history.start()` 监控 `hashchange` 事件并分配路由。
     *
     * @overwrite
     * @public
     * @method start
     * @param {object} opts
     * @return 
     **/
    start : function( opts ) {
        var me = this;

        if ( History.start ) {
            return;
        }
        
        History.start = true;
        
        if ( !opts ) {
            opts = { trigger : true };
        }
        
        // 开始监听hashchange
        if ( ('onhashchange' in window) &&
                ((typeof document.documentMode === 'undefined') ||
                document.documentMode === 8) ) {

            me._onHashChangeEvent();
            
            // 处理当前hash
			if ( opts.trigger ) {
				me.loadUrl.call( me, me.getFragment() );
			}
            
            return;
        }
        
        throw new Error( 'current browser do not suport hashchange event;' );
    },
    
    /**
     * 手动到达应用程序中的某个位置 
     *
     * @overwrite
     * @public
     * @method navigate
     * @param {string} fragment
     * @param {object} opts
     * @return 
     **/
    navigate : function( fragment, opts ) {
        var me = this;

        
        if ( !opts ) {
            opts = { trigger : true };
        }

        fragment = this.getFragment( fragment );

        me._setHash( fragment, opts.replace );

        if ( opts.trigger ) {
            this.loadUrl( fragment );
        }

    },
    
    /**
     * 设置hash 
     *
     * @private
     * @method _setHash
     * @param {string} fragment
     * @param {boolean} replace
     * @return 
     **/
    _setHash : function( fragment, replace ) {
		var me = this,
			folder = '',
            href;
		
		fragment = Chassis.$.trim( fragment ).replace( /^[#]+/, '' );
		
        if ( me.getFragment() !== fragment ) {
		
			me._offHashChangeEvent(); 

            if ( replace ) {
                href = location.href.replace( /(javascript:|#).*$/, '' );

                if ( /android/i.test( navigator.userAgent ) &&
                        'replaceState' in window.history ) {
                    window.history.replaceState( 
                        {}, '', href + '#' + fragment );
                }

                location.replace( href + '#' + fragment );
            } else {

                // Some browsers require that `hash` contains a leading #.
                location.hash = '#' + fragment;
            }
			
			// 处理hash为空时页面回到顶部
			// 因为不考虑webkit之外的浏览器，所以用此方法比较有效
            /* 
			if ( fragment === '' ) {
				folder = location.href.split( '/' ).slice( 3 ).join( '/' );
				folder = '/' + folder.replace( /#(.*?)$/, '' );
                history.pushState( {}, document.title, folder );
			} else {
                location.hash = '#' + fragment; 
			}
            */
			window.setTimeout( function() {
				me._onHashChangeEvent();
			}, 0 );
        }

        return me;
    },
    
    /**
     * 获取hash 
     *
     * @private
     * @method getFragment
     * @return 
     **/
    getFragment : function( fragment ) {
        var match;

        if ( fragment === undefined ) {
            match = location.href.match( /#(.*)$/ );
         
            return match ? match[ 1 ] : '';
        }
        else {
            return fragment.replace( /^[#\/]|\s+$/g, '' );
        }
    },
    
    
    _onHashChangeEvent : function() {
        var me = this;
        $( window ).on( 'hashchange', function( e ) {
			me.loadUrl.call( me, me.getFragment() );
        } );
    },
    _offHashChangeEvent : function() {
        $( window ).off( 'hashchange' );
    }
});