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

describe("Dashboard Material Search Results Widget", () => {
  const m             = require("mithril");
  const TimeFormatter = require('helpers/time_formatter');

  const MaterialSearchResultsWidget = require("views/dashboard/trigger_with_options/material_search_results_widget");

  let $root, root;
  beforeEach(() => {
    [$root, root] = window.createDomElementForTest();
  });

  afterEach(() => {
    window.destroyDomElementForTest();
  });

  let material;

  beforeEach(() => {
    material = {
      performSearch:      jasmine.createSpy('performSearch'),
      searchText:         jasmine.createSpy('searchText'),
      searchInProgress:   jasmine.createSpy('searchInProgress'),
      searchResults:      jasmine.createSpy('searchResults'),
      selectRevision:     jasmine.createSpy('selectRevision'),
      isRevisionSelected: jasmine.createSpy('isRevisionSelected')
    };
    mount();
  });

  afterEach(unmount);

  it("should render results matching count message when search text is absent", () => {
    material.searchText.and.returnValue('');
    material.searchResults.and.returnValue(json);
    m.redraw();
    const expectedMessage = 'Last 4 commits listed in chronological order';
    expect($root.find('.commits .helper')).toContainText(expectedMessage);
  });

  it("should render all matched material search revisions and no message", () => {
    material.searchText.and.returnValue('some search text');
    material.searchResults.and.returnValue(json);
    m.redraw();
    expect($root.find('.commit_info li')).toHaveLength(4);
    expect($root.find('.commits .helper')).toContainText('');
  });

  it("should render commit information", () => {
    material.searchResults.and.returnValue(json);
    m.redraw();

    expect($root.find('.commit_info .rev').get(0)).toContainText(json[0].revision);
    expect($root.find('.commit_info .committer').get(0)).toContainText(json[0].user);
    expect($root.find('.commit_info .time').get(0)).toContainText(TimeFormatter.format(json[0].date));
    expect($root.find('.commit_info .commit_message').get(0)).toContainText(json[0].comment);
  });

  it("should render no revisions found message", () => {
    material.searchText.and.returnValue('foo');
    material.searchResults.and.returnValue([]);
    m.redraw();
    const expectedMessage = `No revisions found matching 'foo'`;
    expect($root.find('.commits .helper')).toContainText(expectedMessage);
  });

  it("should not render view when search is in progress", () => {
    material.searchInProgress.and.returnValue(true);
    m.redraw();
    expect($root.find('.commits')).not.toBeInDOM();
  });

  it("should select searched revision onclick", () => {
    material.searchText.and.returnValue('implemented');
    material.searchResults.and.returnValue(json);
    m.redraw();

    $root.find('.commit_info li').get(1).click();

    expect(material.selectRevision).toHaveBeenCalledWith(json[1].revision);
  });

  const json = [
    {
      "revision": "2a4b782a3a7d2eb13868da75149e716b15f52e5d",
      "user":     "GaneshSPatil <ganeshpl@thoughtworks.com>",
      "date":     "2018-02-12T11:02:48Z",
      "comment":  "implemented feature boo"
    },
    {
      "revision": "7f7653464e14682c7c9ce6a8bf85989a9a52eb35",
      "user":     "GaneshSPatil <ganeshpl@thoughtworks.com>",
      "date":     "2018-02-12T11:01:53Z",
      "comment":  "implemented feature boo"
    },
    {
      "revision": "24d682d8b8a99e8862acac8cae092caeca3a51f3",
      "user":     "GaneshSPatil <ganeshpl@thoughtworks.com>",
      "date":     "2018-02-12T11:01:36Z",
      "comment":  "implemented feature baz"
    },
    {
      "revision": "e5b730abdf7954e7ff45a4c15b2333c550559b35",
      "user":     "GaneshSPatil <ganeshpl@thoughtworks.com>",
      "date":     "2018-02-12T11:01:12Z",
      "comment":  "implemented feature bar"
    }
  ];

  function mount() {
    m.mount(root, {
      view() {
        return m(MaterialSearchResultsWidget, {
          material
        });
      }
    });
    m.redraw(true);
  }

  function unmount() {
    m.mount(root, null);
    m.redraw();
  }
});
