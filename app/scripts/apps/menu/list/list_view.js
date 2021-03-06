define([
	'app',
	"tpl!apps/menu/list/templates/list.tpl",
	"tpl!apps/menu/list/templates/list_item.tpl",
	"tpl!apps/menu/list/templates/confirmDelete.tpl"
], function(App, listTpl, listItemTpl, confirmDeleteTpl){
	App.module("MenuApp.List.View", function(View, App, Backbone, Marionette, $, _){

		View.Kanban = Marionette.ItemView.extend({
			tagName: "li",
			template: listItemTpl,
			className: "kanbanItem",

			triggers: {
				"click .deleteKanban": "kanban:delete"
			},

			events: {
				"click .editKanban": "editKanban",
				"click .submitEditKanban": "submitEditKanban",
				"click .cancelEditKanban": "cancelEditKanban",
				"drop" : "drop"
			},

			
		    drop: function(event, index) {
		    	console.log("drop");
		        this.trigger('kanban:editPosition', this.model, index);
		    }, 

			editKanban: function(e){
				console.log("kanban:edit");
				e.preventDefault();
				e.stopPropagation();

				// make a tag editable
				var a = $(e.currentTarget.parentNode.parentNode);
				a.attr("contentEditable", true);
				a.focus();
				this.setEndOfContenteditable(e.currentTarget.parentNode.parentNode);

				
				// change styles
				a.addClass('light');

				a.find('.editKanban')
					.removeClass('glyphicon-pencil editKanban')
					.addClass('glyphicon-floppy-disk submitEditKanban');
				a.find('.deleteKanban')
					.removeClass('deleteKanban')
					.addClass('cancelEditKanban');


				// keypress event
				var that = this;
				a.keypress(function(ev){
					if(ev.which == 13) {
						ev.preventDefault();
						that.submitEditKanban(e);
					}
				});
			},

			submitEditKanban: function(e){
				console.log("kanban:submit:edit");
				e.preventDefault();
				e.stopPropagation();

				var a = $(e.currentTarget.parentNode.parentNode);
				var title = a.get([0]).firstChild.textContent;		

				console.log("this");
				console.log(this);		

		    	this.trigger("kanban:edit", this.model, title);

				this.showKanban(e);
			},

			cancelEditKanban: function(e){
				console.log("kanban:cancel:edit");
				e.preventDefault();
				e.stopPropagation();

				this.showKanban(e);
			},

			showKanban: function(e){

				// make a tag not editable anymore
				var a = $(e.currentTarget.parentNode.parentNode);
				a.removeAttr("contentEditable");

				// change styles
				a.removeClass('light');
				a.find('.submitEditKanban')
					.removeClass('glyphicon-floppy-disk submitEditKanban')
					.addClass('glyphicon-pencil editKanban');
				a.find('.cancelEditKanban')
					.removeClass('cancelEditKanban')
					.addClass('deleteKanban');

				// re-render model original
				this.render();
			},

			// Focus at the end of the a tag text
			setEndOfContenteditable: function(contentEditableElement){
			    var range,selection;
			    if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
			    {
			        range = document.createRange();//Create a range (a range is a like the selection but invisible)
			        range.selectNodeContents(contentEditableElement.firstChild);//Select the entire contents of the element with the range
			        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
			        selection = window.getSelection();//get the selection object (allows you to change selection)
			        selection.removeAllRanges();//remove any selections already made
			        selection.addRange(range);//make the range you have just created the visible selection
			    }
			    else if(document.selection)//IE 8 and lower
			    { 
			        range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
			        range.moveToElementText(contentEditableElement.firstChild);//Select the entire contents of the element with the range
			        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
			        range.select();//Select the range (make it the visible selection
			    }
			},

			onRender: function(){
				//initializing selected kanban
				var href = this.$el.find('a').attr('href');
				
				if(href === Backbone.history.fragment){

			    	this.$el.find('a').addClass('selected'); 
			  	}
			}

		});

		View.Kanbans = Marionette.CompositeView.extend({
			tagName: "aside",
			className: "sitenav",
			template: listTpl,
			childView: View.Kanban,

			triggers: {
				"click .brand": "home:clicked",
				"click .profile": "home:clicked",
				"click .logout": "logout:clicked"
			},

			events: {
				"click li a": "kanbanClicked",
		        "click .newKanban": "newClicked",
		        "click .submitKanban": "kanbanSubmitted"
		    },	 

		    kanbanClicked: function(e){
		    	console.log("kanban:clicked");
		    	e.preventDefault();

		    	if(e.currentTarget.attributes["contentEditable"]) return;

		    	this.handleSelected(e);
		    	
		    	var href = e.currentTarget.attributes["href"].value;

		    	this.trigger("kanban:clicked", href);
		    },

		    handleSelected: function(e){
		    	// Styles the current kanban and unstyles the previously selected one
		    	
		    	$('aside li a').removeClass('selected'); 
				$('aside li').each(function(){

					if(this === e.currentTarget.parentNode){

				    	$(this).find('a').addClass('selected'); 
				  	}
				})
		    },

		    newClicked: function(){
		    	console.log("new:clicked");

		    	$('.newKanban').slideUp(function(){
		    		$('.inputKanban').slideDown(function(){
		    			$('input').focus();
		    		});
		    	});

		    	// keypress event
				var that = this;
				$('input').keypress(function(ev){
					if(ev.which == 13) {
						that.kanbanSubmitted();
					}
				});
		    	
		    	this.trigger("kanban:new");
		    },

		    kanbanSubmitted: function(){
		    	var title = $('#newKanban').val();
		    	console.log(title);
		    	this.trigger("kanban:submit", title);

		    	window.setTimeout(function(){
		    		$('.inputKanban').slideUp(function(){
		    			$('.newKanban').slideDown(function(){
		    				$('#newKanban').val('');
		    			});
		    		}); 
		    	}, 500 );

		    },

			// Adds the list of kanbans before the add kanban button
			attachHtml: function(collectionView, itemView){

			    collectionView.$(".newKanban").before(itemView.el);
			},

			serializeData: function(){

				return {
					nickname: App.loggedInUser.username,
				}
			},

			onRender : function(){

				// highlighting whole row when hovering submit
				$('.inputKanban .glyphicon').hover(function(){
				    $(this).parent().toggleClass('light');
				    $('.inputKanban input').toggleClass('light');
				});

				require(["jqueryui"], function(){
					$('#kanbanList').sortable({
						items: ".kanbanItem",
						cancel: ".newKanban,[contenteditable]",
				        stop: function(event, ui) {
				            ui.item.trigger('drop', ui.item.index());
				        }
			   		});
			   	});
			   	
			}

		});

		View.confirmDeleteView = Marionette.ItemView.extend({
			template: confirmDeleteTpl,

			events: {
				"click .deleteConfirmation": "deleteConfirmation"
			},

			deleteConfirmation: function(){
				this.trigger("confirm:delete");
			}

		});
	});

	return App.MenuApp.List.View;
});