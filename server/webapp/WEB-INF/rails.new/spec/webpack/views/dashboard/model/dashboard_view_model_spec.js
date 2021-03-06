/*
 * Copyright 2018 ThoughtWorks, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

describe("Dashboard View Model", () => {
  const _           = require('lodash');
  const DashboardVM = require("views/dashboard/models/dashboard_view_model");
  const Dashboard   = require("models/dashboard/dashboard");
  const dashboard   = new Dashboard();

  describe("Dropdown", () => {
    let pipelinesCountMap, dashboardVM;
    beforeEach(() => {
      pipelinesCountMap = {'up42': 2, 'up43': 2};
      dashboard.initialize(dashboardJsonForPipelines(pipelinesCountMap));
      dashboardVM = new DashboardVM();
    });

    it('should initialize dropdown state for each pipeline instance', () => {
      expect(dashboardVM.dropdown.isOpen('up42', 1)).toEqual(false);
      expect(dashboardVM.dropdown.isOpen('up42', 2)).toEqual(false);
      expect(dashboardVM.dropdown.isOpen('up43', 1)).toEqual(false);
      expect(dashboardVM.dropdown.isOpen('up43', 2)).toEqual(false);
    });

    it('should remove invalid pipeline instances from dropdown state', () => {
      expect(dashboardVM.dropdown.isOpen('up42', 1)).toEqual(false);
      expect(dashboardVM.dropdown.isOpen('up42', 2)).toEqual(false);
      expect(dashboardVM.dropdown.isOpen('up43', 1)).toEqual(false);
      expect(dashboardVM.dropdown.isOpen('up43', 2)).toEqual(false);

      dashboardVM.dropdown.show('up42', 1);

      dashboard.initialize(dashboardJsonForPipelines({'up42': 1, 'up43': 1}));

      expect(dashboardVM.dropdown.isOpen('up42', 1)).toEqual(true);
      expect(dashboardVM.dropdown.isOpen('up43', 1)).toEqual(false);
    });

    it('should initialize dropdown states as close initially', () => {
      expect(dashboardVM.dropdown.isOpen('up42', 1)).toEqual(false);
      expect(dashboardVM.dropdown.isOpen('up43', 1)).toEqual(false);
    });

    it('should toggle dropdown state', () => {
      expect(dashboardVM.dropdown.isOpen('up42', 1)).toEqual(false);
      dashboardVM.dropdown.show('up42', 1);
      expect(dashboardVM.dropdown.isOpen('up42', 1)).toEqual(true);
    });

    it('should close all other dropdowns incase of a dropdown is toggled', () => {
      dashboardVM.dropdown.show('up42', 1);

      expect(dashboardVM.dropdown.isOpen('up42', 1)).toEqual(true);
      expect(dashboardVM.dropdown.isOpen('up43', 1)).toEqual(false);
      dashboardVM.dropdown.show('up43', 1);
      expect(dashboardVM.dropdown.isOpen('up42', 1)).toEqual(false);
      expect(dashboardVM.dropdown.isOpen('up43', 1)).toEqual(true);
    });

    it('should hide all dropdowns when the first instance dropdown is open', () => {
      dashboardVM.dropdown.show('up42', 1);
      expect(dashboardVM.dropdown.isOpen('up42', 1)).toEqual(true);
      expect(dashboardVM.dropdown.isOpen('up42', 2)).toEqual(false);
      expect(dashboardVM.dropdown.isOpen('up43', 1)).toEqual(false);
      expect(dashboardVM.dropdown.isOpen('up43', 2)).toEqual(false);
      dashboardVM.dropdown.hide();
      expect(dashboardVM.dropdown.isOpen('up42', 1)).toEqual(false);
      expect(dashboardVM.dropdown.isOpen('up42', 2)).toEqual(false);
      expect(dashboardVM.dropdown.isOpen('up43', 1)).toEqual(false);
      expect(dashboardVM.dropdown.isOpen('up43', 2)).toEqual(false);
    });

    it('should hide all dropdowns when any dropdown other than the first instance\'s is open', () => {
      dashboardVM.dropdown.show('up42', 2);
      expect(dashboardVM.dropdown.isOpen('up42', 1)).toEqual(false);
      expect(dashboardVM.dropdown.isOpen('up42', 2)).toEqual(true);
      expect(dashboardVM.dropdown.isOpen('up43', 1)).toEqual(false);
      expect(dashboardVM.dropdown.isOpen('up43', 2)).toEqual(false);
      dashboardVM.dropdown.hide();
      expect(dashboardVM.dropdown.isOpen('up42', 1)).toEqual(false);
      expect(dashboardVM.dropdown.isOpen('up42', 2)).toEqual(false);
      expect(dashboardVM.dropdown.isOpen('up43', 1)).toEqual(false);
      expect(dashboardVM.dropdown.isOpen('up43', 2)).toEqual(false);
    });

    it('should hide other changes dropdown for the same pipeline but different instance', () => {
      dashboardVM.dropdown.show('up42', 1);
      expect(dashboardVM.dropdown.isOpen('up42', 1)).toEqual(true);
      expect(dashboardVM.dropdown.isOpen('up42', 2)).toEqual(false);
      dashboardVM.dropdown.show('up42', 2);
      expect(dashboardVM.dropdown.isOpen('up42', 1)).toEqual(false);
      expect(dashboardVM.dropdown.isOpen('up42', 2)).toEqual(true);
    });
  });

  describe('Operation Messages', () => {
    let pipelinesCountMap, dashboardVM;
    beforeEach(() => {
      pipelinesCountMap = {'up42': 2, 'up43': 2};
      dashboardVM       = new DashboardVM();
      dashboard.initialize(dashboardJsonForPipelines(pipelinesCountMap));
      jasmine.clock().install();
    });

    afterEach(() => {
      jasmine.clock().uninstall();
    });

    it('should set pipeline operation success messages', () => {
      expect(dashboardVM.operationMessages.get('up42')).toEqual(undefined);

      const message = 'message';
      dashboardVM.operationMessages.success('up42', message);

      expect(dashboardVM.operationMessages.get('up42')).toEqual({message, type: 'success'});
    });

    it('should set pipeline operation failure messages', () => {
      expect(dashboardVM.operationMessages.get('up42')).toEqual(undefined);

      const message = 'message';
      dashboardVM.operationMessages.failure('up42', message);

      expect(dashboardVM.operationMessages.get('up42')).toEqual({message, type: 'error'});
    });

    it('should clear message after timeout interval', () => {
      expect(dashboardVM.operationMessages.get('up42')).toEqual(undefined);

      const message = 'message';
      dashboardVM.operationMessages.failure('up42', message);

      expect(dashboardVM.operationMessages.get('up42')).toEqual({message, type: 'error'});

      jasmine.clock().tick(5001);

      expect(dashboardVM.operationMessages.get('up42')).toEqual(undefined);
    });
  });

  const dashboardJsonForPipelines = (pipelines) => {
    return {
      "_embedded": {
        "pipeline_groups": [
          {
            "_links":         {
              "self": {
                "href": "http://localhost:8153/go/api/config/pipeline_groups/first"
              },
              "doc":  {
                "href": "https://api.go.cd/current/#pipeline-groups"
              }
            },
            "name":           "first",
            pipelines:        _.keys(pipelines),
            "can_administer": true
          }
        ],
        "pipelines":       pipelinesJsonForPipelines(pipelines)
      }
    };
  };

  const getPipelineInstance = (counter) => {
    //need to increment by 1 as pipeline counter starts with 1
    counter++;

    return {
      "_links":       {
        "self":            {
          "href": "http://localhost:8153/go/api/pipelines/up42/instance/1"
        },
        "doc":             {
          "href": "https://api.go.cd/current/#get-pipeline-instance"
        },
        "history_url":     {
          "href": "http://localhost:8153/go/api/pipelines/up42/history"
        },
        "vsm_url":         {
          "href": "http://localhost:8153/go/pipelines/value_stream_map/up42/1"
        },
        "compare_url":     {
          "href": "http://localhost:8153/go/compare/up42/0/with/1"
        },
        "build_cause_url": {
          "href": "http://localhost:8153/go/pipelines/up42/1/build_cause"
        }
      },
      "label":        counter,
      counter,
      "scheduled_at": "2017-11-10T07:25:28.539Z",
      "triggered_by": "changes",
      "_embedded":    {
        "stages": [
          {
            "_links":       {
              "self": {
                "href": "http://localhost:8153/go/api/stages/up42/1/up42_stage/1"
              },
              "doc":  {
                "href": "https://api.go.cd/current/#get-stage-instance"
              }
            },
            "name":         "up42_stage",
            "counter":      "1",
            "status":       "Failed",
            "approved_by":  "changes",
            "scheduled_at": "2017-11-10T07:25:28.539Z"
          }
        ]
      }
    };
  };

  const pipelinesJsonForPipelines = (pipelines) => {
    return _.map((pipelines), (instanceCount, pipelineName) => {
      const instances = _.times(instanceCount, getPipelineInstance);

      return ({
        "_links":                 {
          "self":                 {
            "href": "http://localhost:8153/go/api/pipelines/up42/history"
          },
          "doc":                  {
            "href": "https://api.go.cd/current/#pipelines"
          },
          "settings_path":        {
            "href": "http://localhost:8153/go/admin/pipelines/up42/general"
          },
          "trigger":              {
            "href": "http://localhost:8153/go/api/pipelines/up42/schedule"
          },
          "trigger_with_options": {
            "href": "http://localhost:8153/go/api/pipelines/up42/schedule"
          },
          "pause":                {
            "href": "http://localhost:8153/go/api/pipelines/up42/pause"
          },
          "unpause":              {
            "href": "http://localhost:8153/go/api/pipelines/up42/unpause"
          }
        },
        "name":                   pipelineName,
        "last_updated_timestamp": 1510299695473,
        "locked":                 false,
        "can_pause":              true,
        "pause_info":             {
          "paused":       false,
          "paused_by":    null,
          "pause_reason": null
        },
        "_embedded":              {instances}
      });
    });

  };
});
