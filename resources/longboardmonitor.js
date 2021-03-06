'use strict';
/**
 * 
 */

(function() {


var appCommand = angular.module('longboardmonitor', ['googlechart', 'ui.bootstrap','ngSanitize']);


// appCommand.config();
$('#waitanswer').hide();

// Constant used to specify resource base path (facilitates integration into a Bonita custom page)
appCommand.constant('RESOURCE_PATH', 'pageResource?page=custompage_longboard&location=');


 
	   
// --------------------------------------------------------------------------
//
// Controler DashboardMonitorController
//
// --------------------------------------------------------------------------
	   
// User app list controller
appCommand.controller('DashboardMonitorController', 
	function () {
	
	this.messageList='';
	
		
	var myProcessList = [ {
	   Name : 'processName',
	   Version : '1.0',
	   } ];
	    
	
	
	this.listprocess = function()
	{
	  // retrieve the list of process
	};
		
});

	   
// --------------------------------------------------------------------------
//
// Controler MainControler
//
// --------------------------------------------------------------------------
	
appCommand.controller('MainController', 
	function () {
	
	this.isshowhistory = false;
	
	this.showhistory = function( show )
	{
	   this.isshowhistory = show;
	}

	
		
});
	
// --------------------------------------------------------------------------
//
// Controler ShowHistoryController
//
// --------------------------------------------------------------------------
	
appCommand.controller('ShowHistoryController',
	function ($scope, $http,$sce) {
		this.msg="";
		this.myActivityHistory = [];
		this.synthesis = [];
		this.TimerListEvents =[];
		
		this.param = {'caseId':0, 'showSubProcess':true, 'showProcessData':true, 'showLocalData':true,'showBdmData':true,'showArchivedData':false};

		// alert('init getActivity '+myActivityHistory+'');

		this.historyinprogress=false;
		this.casehistory={};
		
		// -------------------------------------------------
		// Case History
		// -------------------------------------------------
		this.showcasehistory = function()
		{
			var self=this;	
			
			self.historyinprogress=true;
			var json= encodeURI( angular.toJson(self.param, true));

			var url='?page=custompage_longboard&action=casehistory&paramjson='+json+'&t='+Date.now();
										
			$http.get( url )
				.success( function ( jsonResult ) {								
					console.log(" get history",jsonResult);
					self.historyinprogress=false;
					self.casehistory = jsonResult;
					$scope.chartTimeline		 	= JSON.parse(jsonResult.chartTimeline);
					console.log("Chart=>>",jsonResult.chartTimeline);
							}
						)
				.error( function ( result ) {
					// alert('error on showHistory ');
					var jsonResult = JSON.parse(result);
					self.myActivityHistory=jsonResult;
					self.historyinprogress=false;
							}
						);			
		};
		
		// -------------------------------------------------
		// searchByIndex
		// -------------------------------------------------
		this.searchindexresult=[];
		this.searchByIndex = function() {
			var self=this;	
			
			self.historyinprogress=true;
			var json= encodeURI( angular.toJson(self.param, true));

			var url='?page=custompage_longboard&action=searchbyindex&paramjson='+json+'&t='+Date.now();
										
			$http.get( url )
				.success( function ( jsonResult ) {								
								console.log(" get history",jsonResult);
								self.searchindexresult 			= jsonResult.cases;
								self.casehistory.errormessage	= jsonResult.message;								
								self.historyinprogress=false;
							}
						)
				.error( function ( result ) {
								var jsonResult = JSON.parse(result);
								self.myActivityHistory=jsonResult;
								self.historyinprogress=false;

								}
				);			
		}
		// -------------------------------------------------
		// getStyleActivity
		// -------------------------------------------------
		this.getStyleActivity = function(activity) {
			//if (activity.perimeter ==="ARCHIVED")
			//	return "background-color: #ecf0f1";
			if (activity.state==="failed")
				return "background-color: #f2dede";
			if (activity.state==="waiting")
				return "background-color: #d9edf7";
			if (activity.perimeter ==="ACTIVE")
				return "background-color: #dff0d8";
			
			return "n";
		}
		this.isShowVariable = function( variable )
		{
			var result=true;
			// is the scope is acceptable?
			if (variable.scope === 'PROCESS' && !  this.param.showProcessData)
				result= false;
			if (variable.scope === 'LOCAL' && !  this.param.showLocalData)
				result= false;
			if (variable.scope === 'BDM' && !  this.param.showBdmData)
				result= false;
			// actif ?
			if (variable.status=='ARCHIVED' && ! this.param.showArchivedData)
				result= false;

			console.log(" ShowVariable "+variable.name+" scope["+variable.scope+"] Status["+variable.status+"] showProcessData? "+this.param.showProcessData+" showLocalData?"+this.param.showLocalData+" showBdmData?"+this.param.showBdmData+" archived?"+this.param.showArchivedData)
			return result;
		}
		this.getStyleActif = function( item )
		{
			if (item.status=='ACTIF')
				return "background-color: #dff0d8";
			return "";
		}
		
		this.getUrlCaseVisu = function( processinstance) {
			return "/bonita/portal.js/#/admin/monitoring/"+processinstance.processdefinitionid+"-"+processinstance.id+"?diagramOnly=1";
		}
		
		// -------------------------------------------------
		// CancelCase
		// -------------------------------------------------
		this.cancelCase = function()
		{
			if (! confirm('Cancel case? '))
				return;
			var self=this;	
			self.historyinprogress=true;
			
			var url='?page=custompage_longboard&action=cancelcase&caseid='+this.param.caseId+'&t='+Date.now();
								
			$http.get( url )
				.success( function ( jsonResult ) {
					self.historyinprogress=false;
					self.showcasehistory();
					}	
				)
				.error( function ( result ) {
					// alert('error on caseCancel ');
					self.historyinprogress=false;
					var jsonResult = JSON.parse(result);
					self.myActivityHistory=jsonResult;
					}
				);
		};
		
		// -------------------------------------------------
		// Execute Activity
		// -------------------------------------------------
		this.executeActivity = function( activity ) {
			this.notifyActivity( activity, "executeactivity", "Do you want to execute this activity?");
		}
		
		this.releaseUserTask = function( activity ) {
			this.notifyActivity( activity, "releaseUserTask", "Do you want to release the task?");
		}
		
		this.replayActorFilter = function( activity ) {
			this.notifyActivity( activity, "replayActorFilter", "Do you want to reexecute the actor filter?");
		}
		
		this.updateDueDate = function( activity) {
			this.notifyActivity( activity, "updateDueDate&updatedueDate="+activity.updateduedate,"Do you want to update the due date?");
			
		}
		this.replayFailedTask = function( activity) {
			this.notifyActivity( activity, "replayFailedTask", "Do you want to replay the Failed tasks?");
		}
		this.skipFailedTask = function( activity) {
			this.notifyActivity( activity, "skipFailedTask", "Do you want to Skip the Failed tasks?");
		} 
		this.notifyActivity = function( activity, action, confirmMessage) {
			if (! confirm( confirmMessage )) {
				return;
			}
	
			var self=this;
			var selfactivity=activity;
			self.historyinprogress=true;
			
			var url='?page=custompage_longboard&action='+action+'&activityid='+activity.activityId+'&t='+Date.now();
								
			$http.get( url )
				.success( function ( jsonResult ) {
					selfactivity.statusexecution=jsonResult.status;
					selfactivity.listevents=jsonResult.listevents;
					self.historyinprogress=false;
					// self.showcasehistory();
					}	
				)
				.error( function ( result ) {
					self.historyinprogress=false;
					selfactivity.statusexecution="Error during call";
					var jsonResult = JSON.parse(result);
					self.myActivityHistory=jsonResult;
					}
				);
	
		}
		
		// -------------------------------------------------
		// Update Timer
		// -------------------------------------------------
		this.updateTimer = function( scheduletimer )
		{
			if (! confirm('Do you want to change this timer ?'))
				return;
			var self=this;
			self.historyinprogress=true;
			
			var selfscheduletimer=scheduletimer;
			var json= encodeURI( angular.toJson(scheduletimer, true));

			var url='?page=custompage_longboard&action=updatetimer&paramjson='+json+'&t='+Date.now();
								
			$http.get( url )
				.success( function ( jsonResult ) {
					self.historyinprogress=false;
					selfscheduletimer.statusexecution=jsonResult.statusexecution;
					selfscheduletimer.listevents = jsonResult.listevents;
					selfscheduletimer.timerDate= jsonResult.datetrigger;
					// self.showcasehistory();
					}	
				)
				.error( function ( result ) {
					self.historyinprogress=false;
					selfscheduletimer.statusexecution="Error during call";
					
					}
				);
		}

		// -------------------------------------------------
		// sendSignal
		// -------------------------------------------------
		this.sendSignal = function( signal )
		{
			if (! confirm('Do you want to send this signal ?'))
				return;
			var self=this;
			self.historyinprogress=true;
			
			var selfsignal=signal;
			var json= encodeURI( angular.toJson(signal, true));

			var url='?page=custompage_longboard&action=sendsignal&paramjson='+json+'&t='+Date.now();
								
			$http.get( url )
				.success( function ( jsonResult ) {
					self.historyinprogress=false;					
					selfsignal.statusexecution=jsonResult.statusexecution;	
					selfsignal.listevents = jsonResult.listevents;					
					// self.showcasehistory();
					}	
				)
				.error( function ( result ) {
					self.historyinprogress=false;
					selfsignal.statusexecution="Error during call";
					
					}
				);
		}
		// -------------------------------------------------
		// sendMessage
		// -------------------------------------------------
		this.sendMessage = function( caseHistory,  message )
		{
			if (! confirm('Do you want to send this message ?'))
				return;
			var self=this;
			self.historyinprogress=true;
			var selfmessage=message;
			var json= encodeURI( angular.toJson(message, true));

			var url='?page=custompage_longboard&action=sendmessage&paramjson='+json+'&t='+Date.now();
								
			$http.get( url )
				.success( function ( jsonResult ) {
					self.historyinprogress=false;
					selfmessage.statusexecution=jsonResult.statusexecution;
					selfmessage.listevents=jsonResult.listevents;
					}	
				)
				.error( function ( result ) {
					self.historyinprogress=false;
					selfmessage.statusexecution="Error during call";
					
					}
				);
		}
		
		this.getListEvents = function ( listevents ) {
			return $sce.trustAsHtml(  listevents);
		}
		
	} );
	
	
	
// --------------------------------------------------------------------------
//
// Controler MonitoringController
//
// --------------------------------------------------------------------------

appCommand.controller('MonitoringController', 
	function ($scope,$http) {
		this.AvailableProcessor=0;
		this.JvmName="";
		this.MemUsage=0;
		this.MemFree=0;
		this.MemFreeSwap=0;
		this.JvmSystemProperties=0;
		this.JvmVendor=0;
		this.JvmVersion=0;
		this.LastGCInfo=0;
		this.MemUsagePercentage=0;
		this.NumberActiveTransaction=0;
		this.OSArch=0;
		this.OSName=0;
		this.OSVersion=0;
		this.ProcessCPUTime=0;
		this.StartTimeHuman=0;
		this.LoadAverageLastMn=0;
		this.ThreadCount=0;
		this.MemTotalPhysicalMemory=0;
		this.MemTotalSwapSpace=0;
		this.TotalThreadsCpuTime=0;
		this.UpTime=0;
		this.IsSchedulerStarted=0;
		this.CommitedVirtualMemorySize=0;
		this.DatabaseMajorVersion="";
		this.DatabaseMinorVersion="";
		this.DatabaseProductName="";
		this.DatabaseProductVersion="";
		this.errormessage="";
		this.JVMArgs = "";
		this.inprogress=false;
		
		this.isSowJvmArgs=false;
		this.showJvmArgs = function( show ) 
		{
			this.isSowJvmArgs = show;
		}
		
		this.isshowjvmsystemproperties = false;
		this.showjvmsystemproperties = function( show ) 
		{
			this.isshowjvmsystemproperties = show;
		}
		
		
		this.refresh = function()
		{		    
			// alert('current availableprocess '+this.AvailableProcessor);
			
			var self = this;
			self.inprogress=true;
				
			$http.get( '?page=custompage_longboard&action=monitoringapi&t='+Date.now())
			 .success(function success(jsonResult) {	

								console.log('receive ',jsonResult);
								self.AvailableProcessor = jsonResult.AvailableProcessor;
								self.JvmName					= jsonResult.JvmName;
								self.MemUsage					= jsonResult.MemUsage;
								self.MemFree					= jsonResult.MemFree;
								self.MemFreeSwap				= jsonResult.MemFreeSwap;
								self.JvmSystemProperties		= jsonResult.JvmSystemProperties;
								self.JvmVendor					= jsonResult.JvmVendor;
								self.JvmVersion					= jsonResult.JvmVersion;
								self.LastGCInfo					= jsonResult.LastGCInfo;
								self.MemUsagePercentage			= jsonResult.MemUsagePercentage;
								self.NumberActiveTransaction	= jsonResult.NumberActiveTransaction;
								self.OSArch						= jsonResult.OSArch;
								self.OSName						= jsonResult.OSName;								
								self.OSVersion					= jsonResult.OSVersion;
								self.ProcessCPUTime				= jsonResult.ProcessCPUTime;
								self.StartTimeHuman				= jsonResult.StartTimeHuman;
								self.LoadAverageLastMn			= jsonResult.LoadAverageLastMn;
								self.ThreadCount				= jsonResult.ThreadCount;
								self.MemTotalPhysicalMemory		= jsonResult.MemTotalPhysicalMemory;
								self.MemTotalSwapSpace			= jsonResult.MemTotalSwapSpace;
								self.JavaFreeMemory 			= jsonResult.JavaFreeMemory;
								self.JavaTotalMemory 			= jsonResult.JavaTotalMemory;
								self.JavaUsedMemory 			= jsonResult.JavaUsedMemory;
								self.TotalThreadsCpuTime		= jsonResult.TotalThreadsCpuTime;
								self.UpTime						= jsonResult.UpTime;
								self.IsSchedulerStarted			= jsonResult.IsSchedulerStarted;
								self.CommitedVirtualMemorySize	= jsonResult.CommitedVirtualMemorySize;
								self.DatabaseMajorVersion		= jsonResult.DatabaseMajorVersion;
								self.DatabaseMinorVersion		= jsonResult.DatabaseMinorVersion;
								self.DatabaseProductName		= jsonResult.DatabaseProductName;
								self.DatabaseProductVersion		= jsonResult.DatabaseProductVersion;
								self.errormessage 				= jsonResult.errormessage;
								self.JVMArgs					= jsonResult.JVMArgs;
								self.inprogress=false;

								}
						)
			.error( function ( result ) {
				self.inprogress=false;
				}
			);
							
		
		};
		
	} );
	
	
// --------------------------------------------------------------------------
//
// Controler PerformanceController
//
// --------------------------------------------------------------------------
			
appCommand.controller('PerformanceController', 
	function ($scope,$http) {
		
		$scope.BBonitaHomeWriteBASE=0;
		this.runprocesstest = false;
		this.BonitaHomeWriteMS=0;
		this.BonitaHomeWriteFACTOR =0;
		
		this.BonitaHomeReadBASE=0;
		this.BonitaHomeReadMS=0;
		this.BonitaHomeReadFACTOR=0;
		
		this.DatabaseBASE =0;
		this.DatabaseMS =0;
		this.DatabaseFACTOR =0;
		
		this.ProcessDeployBASE =0;
		this.ProcessDeployMS =0;
		this.ProcessDeployFACTOR =0;
		
		this.runbonitahometest=true;
		this.rundatabasetest=true;
		this.runprocesstest=true;
		this.runprocesstestnumber=100;
		this.inprogress=false;
		
		this.runtest = function()
		{		    
			var self = this;
			self.inprogress=true;
			
			var url ='?page=custompage_longboard&action=testperf&t='+Date.now();
			url = url + '&runbonitahometest='+this.runbonitahometest;
			url = url + '&rundatabasetest='+this.rundatabasetest;
			url = url + '&runprocesstest='+this.runprocesstest;
			url = url + '&runprocesstestnumber='+this.runprocesstestnumber;
		
			$http.get( url )
			  .success(function success(jsonResult) {	
				console.log('receive ',jsonResult);
								
				self.BonitaHomeWriteBASE			= jsonResult.BonitaHomeWriteBASE;
				self.BonitaHomeWriteMS				= jsonResult.BonitaHomeWriteMS;
				self.BonitaHomeWriteFACTOR			= jsonResult.BonitaHomeWriteFACTOR;
				
				self.BonitaHomeReadBASE				= jsonResult.BonitaHomeReadBASE;
				self.BonitaHomeReadMS				= jsonResult.BonitaHomeReadMS;
				self.BonitaHomeReadFACTOR			= jsonResult.BonitaHomeReadFACTOR;
					
				self.DatabaseBASE					= jsonResult.DatabaseBASE;
				self.DatabaseMS						= jsonResult.DatabaseMS,
				self.DatabaseFACTOR					= jsonResult.DatabaseFACTOR;				
				
				self.DataMetaBASE					= jsonResult.DataMetaBASE;
				self.DataMetaMS						= jsonResult.DataMetaMS,
				self.DataMetaFACTOR					= jsonResult.DataMetaFACTOR;
				
				self.ProcessDeployBASE				= jsonResult.ProcessDeployBASE;
				self.ProcessDeployMS				= jsonResult.ProcessDeployMS,
				self.ProcessDeployFACTOR			= jsonResult.ProcessDeployFACTOR;
			
				self.ProcessCreateBASE				= jsonResult.ProcessCreateBASE;
				self.ProcessCreateMS				= jsonResult.ProcessCreateMS,
				self.ProcessCreateFACTOR			= jsonResult.ProcessCreateFACTOR;
			
				self.ProcessRunBASE					= jsonResult.ProcessRunBASE;
				self.ProcessRunMS					= jsonResult.ProcessRunMS,
				self.ProcessRunFACTOR				= jsonResult.ProcessRunFACTOR;

				self.errormessage 					= jsonResult.errormessage;

				$scope.chartObject 					= JSON.parse(jsonResult.chartObject);
				console.log("Chart=>>",jsonResult.chartObject);
				self.inprogress=false;

				
			  })
			  .error( function error( result ) {
					self.inprogress=false;
					
				}
			);
							
		};
	} );
	
	
// --------------------------------------------------------------------------
//
// Controler Connector
//
// --------------------------------------------------------------------------
			
appCommand.controller('TimeTrackerController', 
	function ($scope,$http) {
		this.startedstate=false;
		this.info="";
		this.msg="";
		this.startedmsg="";
		this.errormessage="";
		this.info="";
		this.isshowexplanation=false;
		this.allrecords = [];
		this.issimulation=false;
		this.showallinformations=true;
		this.rangedisplayinhour=10;
		this.showrangeDuration=true;
		this.showrangeMaximum=true;
		this.showdetaildescriptionallinformations=false;
		this.showdetaildescriptiontop10=false;
		this.inprogress=false;
		this.isinitstate=false;
		
					
		this.isinit = function() 
		{ return this.isinitstate; }
		
		this.isstarted = function()
		{ return this.startedstate;	}
		
		this.showexplanation = function( show )
		{ this.isshowexplanation = show; }
			
		
		this.runService= function( start )
		{	
			// alert('runService '+start);
			var self = this;
			self.inprogress=true;
			$http.get( '?page=custompage_longboard&action=timetrackerservice&start='+start+'&t='+Date.now())
			  .success(function success(jsonResult) {	
				console.log('receive ',jsonResult);
				self.inprogress=false;
				self.startedstate = jsonResult.isregistered;
				self.startedmsg = jsonResult.startedmsg;
				self.errormessage = jsonResult.errormessage;
				self.msg = jsonResult.msg;
				})
			  .error( function error( result ) {
					self.inprogress=false;
					self.errormessage = 'error during start';								
				}
			);
		}
		
		this.refresh = function()
		{	

			var self = this;
			self.inprogress=true;
			$http.get( '?page=custompage_longboard&action=timetrackergetinfos&issimulation='+self.issimulation+'&showallinformations='+this.showallinformations+'&rangedisplayinhour='+this.rangedisplayinhour+"&rangedisplayDuration="+this.showrangeDuration+"&rangedisplayMaximum="+this.showrangeMaximum+'&t='+Date.now())
			  .success(function success(jsonResult) {	
				self.inprogress=false;
				self.isinitstate=true; // consider now we have the status
				// alert('TimeTracker Success '+jsonResult.startedmsg  );
				console.log('receive ',jsonResult);
				self.info = jsonResult.info;
				self.startedstate = jsonResult.isregistered;
				self.startedmsg = jsonResult.startedmsg;
				self.errormessage = jsonResult.errormessage;
				self.allrecords = jsonResult.allinformations;
				self.display.totallines =self.allrecords.length; 
				self.information = jsonResult.information;
				self.rangeinformations 	= jsonResult.rangeinformations;
				self.top10informations	= jsonResult.top10informations;
				$scope.chartRange 			= JSON.parse(jsonResult.chartRange);
				$scope.chartRepartitionConnector		= JSON.parse(jsonResult.chartRepartitionConnector);
				$scope.chartRepartitionWork			= JSON.parse(jsonResult.chartRepartitionWork);
				})
			  .error( function error( result ) {
				 self.inprogress=false;
				self.errormessage = 'error during getInfo';		
				// alert('Error on TimeTracker');				
				}
			);  
   
		}
		
		this.getstate  = function ()
		{
			var self = this;
			self.inprogress=true;
			
			$http.get( '?page=custompage_longboard&action=timetrackerservicestate')
			  .success(function success(jsonResult) {	

				console.log('receive ',jsonResult);
				self.inprogress=false;
				self.startedstate = jsonResult.isregistered;
				self.startedmsg = jsonResult.startedmsg;
				self.errormessage = jsonResult.errormessage;
				})
			  .error( function error( result ) {
				self.inprogress=false;
				self.errormessage = 'error during getState';		
				
				}
			);  
			};
		
			this.display={  'numberperpage':100, 'pagenumber':1, 'totallines':0 };
			
			this.getPageResult = function()
			{
				var linedeb = (this.display.pagenumber-1) * parseInt(this.display.numberperpage);
				var lineend = linedeb + parseInt(this.display.numberperpage);
				var result = this.allrecords.slice(linedeb, lineend);
				console.log("lineDeb="+linedeb+", to "+lineend+" result="+result.length);
				
				return result;
			}
	});
	

// --------------------------------------------------------------------------
//
// Controler ServerParamController
//
// --------------------------------------------------------------------------
			
appCommand.controller('ServerParamController', 
	function ($scope,$http) {
		this.CustompageDebug=false;
		this.PersistencehibernateEnableWordSearch='';
		this.inprogress=false;

	
		this.refresh = function()
		{	
			this.inprogress=true;

			var self = this;
			self.inprogress=true;
			$http.get( '?page=custompage_longboard&action=serverparams&t='+Date.now())
			  .success(function success(jsonResult) {	
				console.log('receive ',jsonResult);
				self.CustompageDebug 						= jsonResult.CustompageDebug;
				self.errormessage 							= jsonResult.errormessage;
				
				self.PersistencehibernateEnableWordSearch = jsonResult.PersistencehibernateEnableWordSearch;
				self.inprogress=false;
				})
			  .error( function error( result ) {
				self.errormessage = 'error during getInfo';								
				self.inprogress=false;
				}
			);  
   
		}
		
	});
		
	
	
// --------------------------------------------------------------------------
//
// Controler MonitorProcessController
//
// --------------------------------------------------------------------------
			
appCommand.controller('MonitorProcessController', 
	function ($scope,$http) {
		this.alldetails=true;
		this.processes = [ ];
		this.isshowlegend=false;
		this.defaultWarningNbOverflowTasks=20;
		this.defaultWarningNearbyTasks=50;
		this.defaultWarningNbTasks=0;
		this.activityPeriodInMn=120;
		this.defaultmaxitems=1000;
		this.inprogress = false;
		
		this.showlegend = function( show )
		{
			this.isshowlegend = show;
		};
		this.refresh = function()
		{	
		
			
			var postMsg = {
					defaultWarningNearbyTasks: this.defaultWarningNearbyTasks,
					defaultWarningNbOverflowTasks: this.defaultWarningNbOverflowTasks,
					defaultWarningNbTasks: this.defaultWarningNbTasks,
					activityPeriodInMn: this.activityPeriodInMn,
					defaultmaxitems: this.defaultmaxitems,
					studypastactivities: this.studypastactivities,
				};
			
			
			
			var self = this;
			self.inprogress = true;
			
			$http.get( '?page=custompage_longboard&action=monitoringprocess&paramjson='+ angular.toJson(postMsg, true)+'&t='+Date.now())
			  .success(function success(jsonResult) {	
				console.log('receive ',jsonResult);
				self.processes 						= jsonResult.processes;
				self.errormessage 					= jsonResult.errormessage;
				self.inprogress = false;
				console.log(self.processes);
				})
			  .error( function error( result ) {
				self.errormessage = 'error during getInfo';								
				self.inprogress = false;
			  }
			);  
   
		};
		
		
		
	});
		
	
		
	
	
})();